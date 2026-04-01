import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const page = await prisma.facebookPage.findUnique({ where: { userId } });
    if (!page) {
      return NextResponse.json({ conversations: [], stats: { total: 0, unread: 0 } });
    }

    // Get contacts with their latest message
    const contacts = await prisma.contact.findMany({
      where: { pageId: page.id },
      include: {
        messages: {
          orderBy: [{ timestamp: "desc" }, { id: "desc" }],
          take: 1,
        },
        _count: {
          select: {
            messages: { where: { isRead: false, direction: "INBOUND" } },
          },
        },
      },
      orderBy: { lastInteractiveAt: "desc" },
    });

    const conversations = contacts.map(c => ({
      id: c.id,
      psid: c.psid,
      name: [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown User",
      profilePic: c.profilePic,
      lastMessage: c.messages[0]?.text || "",
      lastMessageTime: c.messages[0]?.timestamp || c.lastInteractiveAt,
      lastMessageDirection: c.messages[0]?.direction || "INBOUND",
      unreadCount: c._count.messages,
      createdAt: c.createdAt,
    }));

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    return NextResponse.json({
      conversations,
      stats: {
        total: conversations.length,
        unread: totalUnread,
      },
    });
  } catch (error) {
    console.error("[INBOX_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
