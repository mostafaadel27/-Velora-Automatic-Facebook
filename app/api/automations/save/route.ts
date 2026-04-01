import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await req.json();
    const { nodes, edges, pageId, postType, postId, keywords, replyText, dmText, name } = body;

    if (!pageId) {
      return NextResponse.json({ error: "Please select a Facebook page" }, { status: 400 });
    }

    // Get the internal page record
    const page = await prisma.facebookPage.findUnique({ where: { userId } });
    if (!page || page.pageId !== pageId) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const flowData = JSON.stringify({ nodes, edges });

    // Create or update the automation flow
    const flow = await prisma.automationFlow.create({
      data: {
        pageId: page.id,           // Internal DB id
        name: name || "Untitled Automation",
        triggerKeywords: keywords || "",
        targetPostId: postType === "specific" ? postId : null,
        replyText: replyText || null,
        dmText: dmText || null,
        flowData,
        isActive: true,
      }
    });

    return NextResponse.json({ success: true, flowId: flow.id });

  } catch (error) {
    console.error("[SAVE_AUTOMATION]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
