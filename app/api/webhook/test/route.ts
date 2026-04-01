import { NextResponse } from "next/server";
import { getWebhookLogs } from "../facebook/route";

/**
 * Debug endpoint: GET /api/webhook/test
 * Returns the last webhook events received — useful for checking if Facebook
 * is actually sending events to your webhook.
 */
export async function GET() {
  const logs = getWebhookLogs();

  return NextResponse.json({
    status: "Webhook debug endpoint is working",
    totalLogs: logs.length,
    verifyToken: process.env.WEBHOOK_VERIFY_TOKEN ? "SET" : "NOT SET",
    logs,
    help: {
      noLogs: "If there are no logs, Facebook is not sending events to your webhook URL.",
      checkList: [
        "1. Is your app deployed (not localhost)? Facebook can't reach localhost.",
        "2. Did you subscribe to 'feed' and 'messages' in Facebook App Dashboard > Webhooks?",
        "3. Is your Facebook App in Live Mode? (Settings > Basic > App Mode)",
        "4. Is the webhook URL correct? Should be: https://your-domain.com/api/webhook/facebook",
        "5. After changing OAuth scope, did the user re-connect their Facebook account?",
      ],
    },
  });
}
