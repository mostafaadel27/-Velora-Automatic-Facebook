import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { replyToComment, sendPrivateReply, getUserProfile } from "@/lib/facebook";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "velora_webhook_secret";

// In-memory log for debugging (last 30 events)
const webhookLogs: { timestamp: string; type: string; detail: string }[] = [];
function logWebhook(type: string, detail: string) {
  const entry = { timestamp: new Date().toISOString(), type, detail };
  webhookLogs.push(entry);
  if (webhookLogs.length > 30) webhookLogs.shift();
  console.log(`[WEBHOOK][${type}] ${detail}`);
}

// Export logs for the debug endpoint
export function getWebhookLogs() {
  return webhookLogs;
}

/**
 * Helper to get or create a contact in the database
 */
async function getOrCreateContact(internalPageId: string, psid: string, accessToken: string) {
  try {
    let contact = await prisma.contact.findUnique({
      where: { psid },
    });

    if (!contact) {
      logWebhook("CONTACT", `Creating new contact for PSID: ${psid}`);
      let profile: { firstName?: string; lastName?: string; profilePic?: string } | null = null;
      try {
        profile = await getUserProfile(psid, accessToken);
      } catch (err) {
        logWebhook("CONTACT_WARN", `Could not fetch profile for ${psid}: ${err}`);
      }

      contact = await prisma.contact.create({
        data: {
          psid,
          pageId: internalPageId,
          firstName: profile?.firstName || "Facebook",
          lastName: profile?.lastName || "User",
          profilePic: profile?.profilePic || null,
        },
      });
      logWebhook("CONTACT", `Created contact: ${contact.firstName} ${contact.lastName} (${contact.id})`);
    } else {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { lastInteractiveAt: new Date() },
      });
    }

    return contact;
  } catch (error) {
    logWebhook("CONTACT_ERROR", `Failed: ${error}`);
    return null;
  }
}

/**
 * Helper to save a message to the database
 */
async function saveMessage(contactId: string, text: string, direction: "INBOUND" | "OUTBOUND") {
  try {
    return await prisma.message.create({
      data: {
        contactId,
        text,
        direction,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    logWebhook("MSG_SAVE_ERROR", `Failed to save message: ${error}`);
    return null;
  }
}

/**
 * GET: Facebook Webhook Verification
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  logWebhook("VERIFY", `mode=${mode}, token=${token}, expected=${VERIFY_TOKEN}`);

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    logWebhook("VERIFY", "✅ Verified successfully!");
    return new Response(challenge, { status: 200 });
  }

  logWebhook("VERIFY", "❌ Verification FAILED — token mismatch or missing params");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * POST: Facebook Webhook Event Handler
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    logWebhook("EVENT", `Received: object=${body.object}, entries=${body.entry?.length || 0}`);

    if (body.object !== "page") {
      logWebhook("EVENT", `Ignored — object is "${body.object}", not "page"`);
      return NextResponse.json({ status: "ignored" });
    }

    for (const entry of body.entry || []) {
      const pageId = entry.id;
      logWebhook("ENTRY", `Processing page entry: ${pageId}`);

      // Find the page in our database
      const page = await prisma.facebookPage.findUnique({
        where: { pageId },
      });

      if (!page) {
        logWebhook("ENTRY", `⚠️ Page ${pageId} NOT found in database — skipping`);
        continue;
      }

      logWebhook("ENTRY", `Found page in DB: "${page.name}" (internal ID: ${page.id})`);

      // ──────────────── MESSENGER EVENTS ────────────────
      if (entry.messaging && entry.messaging.length > 0) {
        logWebhook("MESSAGING", `Processing ${entry.messaging.length} messaging event(s)`);

        for (const messaging of entry.messaging) {
          const senderId = messaging.sender?.id;
          const recipientId = messaging.recipient?.id;

          // Skip echo messages (messages sent BY the page)
          if (messaging.message?.is_echo) {
            logWebhook("MESSAGING", `Skipping echo message from page`);
            continue;
          }

          if (messaging.message) {
            const messageText = messaging.message.text || "(attachment)";
            logWebhook("MESSAGING", `📩 New DM from ${senderId}: "${messageText}"`);

            const contact = await getOrCreateContact(page.id, senderId, page.accessToken);
            if (contact) {
              await saveMessage(contact.id, messageText, "INBOUND");
              logWebhook("MESSAGING", `✅ Saved message for ${contact.firstName}`);
            } else {
              logWebhook("MESSAGING", `❌ Could not create/find contact for ${senderId}`);
            }
          }
        }
      }

      // ──────────────── FEED (COMMENT) EVENTS ────────────────
      if (entry.changes && entry.changes.length > 0) {
        logWebhook("FEED", `Processing ${entry.changes.length} change(s)`);

        for (const change of entry.changes) {
          logWebhook("FEED", `Change: field=${change.field}, item=${change.value?.item}, verb=${change.value?.verb}`);

          if (change.field !== "feed") {
            logWebhook("FEED", `Skipping non-feed change: ${change.field}`);
            continue;
          }

          const value = change.value;
          if (value.item !== "comment" || value.verb !== "add") {
            logWebhook("FEED", `Skipping: item=${value.item}, verb=${value.verb}`);
            continue;
          }

          // Skip the page's own comments
          if (value.from?.id === pageId) {
            logWebhook("FEED", `Skipping own comment from page`);
            continue;
          }

          const commentId = value.comment_id;
          const commentMessage = value.message || "";
          const postId = value.post_id;
          const commenterId = value.from?.id;
          const commenterName = value.from?.name || "Unknown";

          logWebhook("FEED", `💬 New comment by ${commenterName} (${commenterId}) on post ${postId}: "${commentMessage}"`);

          // ──── AUTOMATION MATCHING ────
          const flows = await prisma.automationFlow.findMany({
            where: { pageId: page.id, isActive: true },
          });

          logWebhook("AUTOMATION", `Found ${flows.length} active flow(s) for this page`);

          if (flows.length === 0) {
            logWebhook("AUTOMATION", `⚠️ No active automations — nothing to do`);
            continue;
          }

          for (const flow of flows) {
            logWebhook("AUTOMATION", `Checking flow: "${flow.name}" (keywords: "${flow.triggerKeywords}", targetPost: ${flow.targetPostId || "any"})`);

            // Check specific post target
            if (flow.targetPostId) {
              const matchesPost = postId === flow.targetPostId ||
                postId.endsWith(`_${flow.targetPostId}`) ||
                flow.targetPostId === postId.split("_").pop();

              if (!matchesPost) {
                logWebhook("AUTOMATION", `❌ Post ID mismatch — skipping flow "${flow.name}"`);
                continue;
              }
            }

            // Check keywords
            const keywords = flow.triggerKeywords
              .split(",")
              .map((k: string) => k.trim().toLowerCase())
              .filter((k: string) => k.length > 0);

            if (keywords.length > 0) {
              const matched = keywords.some((kw: string) => commentMessage.toLowerCase().includes(kw));
              if (!matched) {
                logWebhook("AUTOMATION", `❌ No keyword match for "${commentMessage}" against [${keywords.join(", ")}]`);
                continue;
              }
              logWebhook("AUTOMATION", `✅ Keyword matched!`);
            } else {
              logWebhook("AUTOMATION", `✅ No keywords set — matching any comment`);
            }

            logWebhook("AUTOMATION", `🚀 Executing flow: "${flow.name}"`);

            // Create contact for the commenter (use commenter ID as PSID)
            const contact = await getOrCreateContact(page.id, commenterId, page.accessToken);

            // ── Send Public Comment Reply ──
            if (flow.replyText) {
              logWebhook("ACTION", `Replying to comment ${commentId} with: "${flow.replyText}"`);
              const res = await replyToComment(commentId, flow.replyText, page.accessToken);
              if (res.success) {
                logWebhook("ACTION", `✅ Comment reply sent successfully`);
                if (contact) await saveMessage(contact.id, flow.replyText, "OUTBOUND");
              } else {
                logWebhook("ACTION", `❌ Comment reply FAILED: ${res.error}`);
              }
            }

            // ── Send Private DM ──
            if (flow.dmText) {
              logWebhook("ACTION", `Sending private reply to comment ${commentId}: "${flow.dmText}"`);
              const res = await sendPrivateReply(commentId, flow.dmText, page.accessToken);
              if (res.success) {
                logWebhook("ACTION", `✅ Private DM sent successfully`);
                if (contact) await saveMessage(contact.id, flow.dmText, "OUTBOUND");
              } else {
                logWebhook("ACTION", `❌ Private DM FAILED: ${res.error}`);
              }
            }

            // Update metrics
            await prisma.automationFlow.update({
              where: { id: flow.id },
              data: { metricsSent: { increment: 1 } },
            });

            logWebhook("AUTOMATION", `✅ Flow "${flow.name}" executed — metrics updated`);
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    logWebhook("FATAL_ERROR", `Webhook handler crashed: ${error}`);
    console.error("[WEBHOOK_FATAL]", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
