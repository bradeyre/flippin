'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, User, Clock } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  otherUser: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  listing: {
    id: string;
    title: string;
    images: string[];
  } | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    read: boolean;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data.conversations || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="mt-1 text-sm text-gray-500">Chat with buyers and sellers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">
              Start a conversation by messaging a seller or buyer
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link
                key={conv.otherUser.id}
                href={`/messages/${conv.otherUser.id}${conv.listing ? `?listing=${conv.listing.id}` : ''}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {conv.otherUser.firstName} {conv.otherUser.lastName}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {conv.listing && (
                      <div className="flex items-center gap-2 mb-2">
                        {conv.listing.images.length > 0 && (
                          <img
                            src={conv.listing.images[0]}
                            alt={conv.listing.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <p className="text-sm text-gray-600 truncate">{conv.listing.title}</p>
                      </div>
                    )}

                    <p className={`text-sm truncate ${
                      !conv.lastMessage.read ? 'font-medium text-gray-900' : 'text-gray-600'
                    }`}>
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

