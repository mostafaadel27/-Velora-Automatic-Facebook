import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConversations, getConversationMessages, getUserProfile } from "@/lib/facebook";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    
    // 1. Get the Facebook Page for this user
    const page = await prisma.facebookPage.findUnique({
      where: { userId },
    });

    if (!page) {
      return NextResponse.json({ error: "No Facebook Page connected" }, { status: 404 });
    }

    console.log(`[SYNC] Starting sync for page: ${page.name} (${page.pageId})`);

    // 2. Fetch conversations from Facebook API
    const conversations = await getConversations(page.accessToken);
    console.log(`[SYNC] Found ${conversations.length} conversations`);

    for (const conv of conversations) {
      const convId = conv.id;
      const participants = conv.participants?.data || [];
      
      // Find the participant that is NOT our page (the customer)
      const customer = participants.find((p: any) => p.id !== page.pageId);
      if (!customer) continue;

      const psid = customer.id;
      const customerName = customer.name;
      const pictureFromParticipants = customer.picture?.data?.url;

      // 3. Upsert Contact
      let contact = await prisma.contact.findUnique({
        where: { psid },
      });

      // Fetch real image URL from Facebook Graph JSON
      let profilePic = null;
      try {
        const picRes = await fetch(`https://graph.facebook.com/${psid}/picture?type=square&height=100&width=100&redirect=0&access_token=${page.accessToken}`);
        const picData = await picRes.json();
        profilePic = picData?.data?.url || null;
      } catch (e) {
        console.error("[SYNC_PIC_ERROR]", e);
      }
      
      const profile = await getUserProfile(psid, page.accessToken);
      const firstName = profile?.firstName || customerName.split(" ")[0] || "Unknown";
      const lastName = profile?.lastName || customerName.split(" ").slice(1).join(" ") || "User";
      profilePic = profilePic || profile?.profilePic || null;

      if (!contact) {
        console.log(`[SYNC] Creating new contact: ${customerName} (${psid})`);
        contact = await prisma.contact.create({
          data: {
            psid,
            pageId: page.id,
            firstName,
            lastName,
            profilePic,
          }
        });
      } else {
        // Update profile info if it has changed or was missing
        contact = await prisma.contact.update({
          where: { id: contact.id },
          data: {
            firstName: firstName !== "Unknown" ? firstName : contact.firstName,
            lastName: lastName !== "User" ? lastName : contact.lastName,
            profilePic: profilePic || contact.profilePic,
          }
        });
      }

      // 4. Fetch messages history for this conversation
      const fbMessages = await getConversationMessages(convId, page.accessToken);
      
      for (const msg of fbMessages) {
        // Only save if it's a plain text message for now
        if (!msg.message) continue;

        // Check if message exists (Wait, we don't have a unique FB message ID in Prisma model yet, 
        // let's just avoid duplicate text/timestamp combos for now, or assume this is a one-off sync)
        // For simplicity in this dev environment, let's just check if a message with the same text and rough time exists
        const existingCount = await prisma.message.count({
            where: {
                contactId: contact.id,
                text: msg.message,
                // Check if it's within 5 seconds of the timestamp
                timestamp: {
                   gte: new Date(new Date(msg.created_time).getTime() - 5000),
                   lte: new Date(new Date(msg.created_time).getTime() + 5000),
                }
            }
        });

        if (existingCount === 0) {
            await prisma.message.create({
                data: {
                    contactId: contact.id,
                    text: msg.message,
                    direction: msg.from?.id === page.pageId ? "OUTBOUND" : "INBOUND",
                    timestamp: new Date(msg.created_time),
                    isRead: true, // Existing messages are assumed read
                }
            });
        }
      }

      // 5. Update contact's last interactive time to match FB's updated_time
      await prisma.contact.update({
          where: { id: contact.id },
          data: { lastInteractiveAt: new Date(conv.updated_time) }
      });
    }

    console.log(`[SYNC] Completed sync for ${conversations.length} conversations`);
    return NextResponse.json({ success: true, count: conversations.length });
  } catch (error) {
    console.error("[SYNC_ERROR]", error);
    return NextResponse.json({ error: "Internal Sync Error" }, { status: 500 });
  }
}
