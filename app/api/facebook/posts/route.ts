import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
    }

    const userId = (session.user as any).id as string;

    // Get the page from DB to get its access token
    const page = await prisma.facebookPage.findUnique({
      where: { userId }
    });

    if (!page || page.pageId !== pageId) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Call Facebook Graph API to get page's posts
    const graphUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url&limit=20&access_token=${page.accessToken}`;
    const fbRes = await fetch(graphUrl);
    const fbData = await fbRes.json();

    if (fbData.error) {
      console.error("[FACEBOOK_POSTS_ERROR]", fbData.error);
      return NextResponse.json({ posts: [], error: fbData.error.message });
    }

    if (!fbData.data || fbData.data.length === 0) {
      return NextResponse.json({ posts: [], message: "No posts found." });
    }

    // Return posts with only the fields the UI needs
    const posts = fbData.data.map((post: any) => ({
      id: post.id,
      message: post.message || "(No text)",
      createdTime: post.created_time,
      picture: post.full_picture || null,
      permalink: post.permalink_url || null,
    }));

    return NextResponse.json({ posts });

  } catch (error) {
    console.error("[FACEBOOK_POSTS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
