import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/messages
 * Get user's conversations
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const otherUserId = searchParams.get('otherUserId');

    let where: any = {
      OR: [
        { senderId: user.id },
        { recipientId: user.id },
      ],
    };

    if (listingId) {
      where.listingId = listingId;
    }

    if (otherUserId) {
      where.AND = [
        {
          OR: [
            { senderId: user.id, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: user.id },
          ],
        },
      ];
    }

    const messages = await db.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Group messages by conversation
    const conversations = new Map<string, any>();

    messages.forEach((message) => {
      const otherUserId = message.senderId === user.id ? message.recipientId : message.senderId;
      const otherUser = message.senderId === user.id ? message.recipient : message.sender;

      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          otherUser,
          listing: message.listing,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      const conv = conversations.get(otherUserId);
      if (message.createdAt > conv.lastMessage.createdAt) {
        conv.lastMessage = message;
      }
      if (!message.read && message.recipientId === user.id) {
        conv.unreadCount++;
      }
    });

    return NextResponse.json({
      conversations: Array.from(conversations.values()),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId, listingId, content } = await req.json();

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Recipient ID and content are required' },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        senderId: user.id,
        recipientId,
        listingId: listingId || null,
        content,
        read: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        listing: listingId ? {
          select: {
            id: true,
            title: true,
            images: true,
          },
        } : undefined,
      },
    });

    // TODO: Send email notification to recipient
    // TODO: Send real-time notification if user is online

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      {
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

