import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    // Check if this user already has a page saved in the DB
    let page = await prisma.facebookPage.findUnique({
      where: { userId }
    });

    // If page exists, return it immediately
    if (page) {
      return NextResponse.json({
        pages: [{
          id: page.id,
          pageId: page.pageId,
          name: page.name,
          picture: page.picture,
        }]
      });
    }

    // No page cached yet — try to fetch from Facebook Graph API
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.facebookAccessToken) {
      // User hasn't granted page permissions yet (or logged in before the scope update)
      return NextResponse.json({ pages: [], needsReconnect: true });
    }

    // Call Facebook Graph API to get user's pages
    const graphUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,picture&access_token=${user.facebookAccessToken}`;
    const fbRes = await fetch(graphUrl);
    const fbData = await fbRes.json();

    if (fbData.error) {
      console.error("[FACEBOOK_GRAPH_ERROR]", fbData.error);
      return NextResponse.json({ pages: [], error: fbData.error.message });
    }

    if (!fbData.data || fbData.data.length === 0) {
      return NextResponse.json({ pages: [], message: "No Facebook Pages found for this account." });
    }

    // Save the first page to the database (schema enforces 1 page per user)
    const fbPage = fbData.data[0];
    const pictureUrl = fbPage.picture?.data?.url || null;

    page = await prisma.facebookPage.create({
      data: {
        userId: userId,
        pageId: fbPage.id,
        name: fbPage.name,
        accessToken: fbPage.access_token,
        picture: pictureUrl,
      }
    });

    return NextResponse.json({
      pages: [{
        id: page.id,
        pageId: page.pageId,
        name: page.name,
        picture: page.picture,
      }]
    });

  } catch (error) {
    console.error("[FACEBOOK_PAGES_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
