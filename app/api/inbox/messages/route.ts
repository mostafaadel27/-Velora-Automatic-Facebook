import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDirectMessage } from "@/lib/facebook";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contactId = req.nextUrl.searchParams.get("contactId");
    if (!contactId) {
      return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { contactId },
      orderBy: { timestamp: "asc" },
    });

    // Mark inbound messages as read
    await prisma.message.updateMany({
      where: { contactId, direction: "INBOUND", isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({
      messages: messages.map(m => ({
        id: m.id,
        text: m.text,
        direction: m.direction,
        isRead: m.isRead,
        timestamp: m.timestamp,
      })),
    });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await req.json();
    const { contactId, text } = body;

    if (!contactId || !text) {
      return NextResponse.json({ error: "Missing contactId or text" }, { status: 400 });
    }

    // 1. Get contact, its PSID and the associated page token
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        page: true,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // 2. Send message via Facebook API
    const fbRes = await sendDirectMessage(contact.psid, text, contact.page.accessToken);
    if (!fbRes.success) {
      console.error("[MESSAGES_POST_FB_ERROR]", {
        psid: contact.psid,
        error: fbRes.error,
        pageName: contact.page.name
      });
      return NextResponse.json({ error: fbRes.error || "Facebook API Error" }, { status: 502 });
    }

    // 3. Save to database
    const savedMsg = await prisma.message.create({
      data: {
        contactId,
        text,
        direction: "OUTBOUND",
        timestamp: new Date(),
        isRead: true,
      },
    });

    // 4. Update contact last interactive
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastInteractiveAt: new Date() },
    });

    return NextResponse.json({ message: savedMsg });
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
