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

    // Get user's page
    const page = await prisma.facebookPage.findUnique({ where: { userId } });
    if (!page) {
      return NextResponse.json({ automations: [], stats: { total: 0, active: 0, totalSent: 0 } });
    }

    // Get all automations for this page
    const automations = await prisma.automationFlow.findMany({
      where: { pageId: page.id },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: automations.length,
      active: automations.filter(a => a.isActive).length,
      totalSent: automations.reduce((sum, a) => sum + a.metricsSent, 0),
    };

    return NextResponse.json({
      automations: automations.map(a => ({
        id: a.id,
        name: a.name,
        keywords: a.triggerKeywords,
        targetPostId: a.targetPostId,
        replyText: a.replyText,
        dmText: a.dmText,
        isActive: a.isActive,
        metricsSent: a.metricsSent,
        createdAt: a.createdAt,
      })),
      stats,
      pageName: page.name,
    });
  } catch (error) {
    console.error("[AUTOMATIONS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// Toggle automation active status
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    const flow = await prisma.automationFlow.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, isActive: flow.isActive });
  } catch (error) {
    console.error("[AUTOMATIONS_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// Delete automation
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.automationFlow.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AUTOMATIONS_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
