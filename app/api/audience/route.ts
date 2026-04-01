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
    const page = await prisma.facebookPage.findUnique({ where: { userId } });
    if (!page) {
      return NextResponse.json({ contacts: [], stats: { total: 0 } });
    }

    const contacts = await prisma.contact.findMany({
      where: { pageId: page.id },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { lastInteractiveAt: "desc" },
    });

    return NextResponse.json({
      contacts: contacts.map(c => ({
        id: c.id,
        psid: c.psid,
        name: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown User",
        profilePic: c.profilePic,
        totalMessages: c._count.messages,
        createdAt: c.createdAt,
        lastActive: c.lastInteractiveAt,
      })),
      stats: {
        total: contacts.length,
      },
      pageName: page.name,
    });
  } catch (error) {
    console.error("[AUDIENCE_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
