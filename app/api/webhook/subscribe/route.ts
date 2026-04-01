import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribePageToApp, getPageSubscriptions } from "@/lib/facebook";

/**
 * GET /api/webhook/subscribe
 * Check the current webhook subscription status for all pages in DB
 *
 * POST /api/webhook/subscribe
 * Force re-subscribe all pages to receive webhook events
 */

export async function GET() {
  try {
    const pages = await prisma.facebookPage.findMany();

    if (pages.length === 0) {
      return NextResponse.json({
        status: "No pages found in database",
        help: "Connect a Facebook page first via the dashboard",
      });
    }

    const results = [];
    for (const page of pages) {
      const subs = await getPageSubscriptions(page.pageId, page.accessToken);
      results.push({
        pageName: page.name,
        pageId: page.pageId,
        subscriptions: subs.data || [],
        error: subs.error || null,
      });
    }

    return NextResponse.json({
      status: "ok",
      pages: results,
    });
  } catch (error) {
    console.error("[SUBSCRIBE_CHECK]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const pages = await prisma.facebookPage.findMany();

    if (pages.length === 0) {
      return NextResponse.json({
        status: "No pages found",
        help: "Connect a Facebook page first",
      });
    }

    const results = [];
    for (const page of pages) {
      const result = await subscribePageToApp(page.pageId, page.accessToken);
      results.push({
        pageName: page.name,
        pageId: page.pageId,
        subscribed: result.success,
        error: result.error || null,
      });
    }

    return NextResponse.json({
      status: "done",
      results,
      help: "If subscription failed, re-connect Facebook with the correct permissions.",
    });
  } catch (error) {
    console.error("[SUBSCRIBE_FORCE]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
