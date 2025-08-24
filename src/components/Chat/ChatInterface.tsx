
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from '../../utils/types';
import { sendChatMessage, listenToChatMessages } from '../../data/chatMessages';
import { getOrderById } from '../../backend/order';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { get } from 'http';
import { getShopOwnerId } from '@/backend/shop';
import { getUserById } from '@/backend/authService';

interface ChatInterfaceProps {
  orderId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ orderId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<{ [key: string]: any }>({});
  const [chatPartner, setChatPartner] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);


  const fetchUserById = async (userId: string) => {
    if (userCache[userId]) return userCache[userId];
    try {
      const user = await getUserById(userId);
      if (user) {
        setUserCache(prev => ({ ...prev, [userId]: user }));
        return user;
      }
    } catch (err) {
      console.warn(`Failed to fetch user ${userId}`, err);
    }
    return null;
  };

  // 🔄 Load specific order by orderId
  useEffect(() => {
    const loadOrder = async () => {
      if (!currentUser) return;
      try {
        const foundOrder = await getOrderById(orderId);
        setOrder(foundOrder || null);
        
        const partnerId = currentUser.role === 'customer' ? foundOrder?.shopId : foundOrder?.customerId || null;
        setChatPartnerId(partnerId);

        if (partnerId) {
          if (currentUser.role === 'customer') {
            const shopOwner = await getShopOwnerId(partnerId);
            const chatPartner = await fetchUserById(shopOwner);
            console.log(`Partner ID: ${chatPartner}`);
            setChatPartner(chatPartner);
          } else {
            const chatPartner = await fetchUserById(partnerId);
            console.log(`Partner ID: ${chatPartner}`);
            setChatPartner(chatPartner);
          }
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
    };
    loadOrder();
  }, [currentUser, orderId]);


  // ✅ Listen to messages
  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    const unsubscribe = listenToChatMessages(orderId, async (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Fetch missing users from messages
  useEffect(() => {
    const fetchSenders = async () => {
      const senderIds = [...new Set(messages.map(msg => msg.senderId))];
      const missing = senderIds.filter(id => !userCache[id]);
      await Promise.all(missing.map(fetchUserById));
    };
    if (messages.length) fetchSenders();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatPartnerId) return;
    console.log('Sending message:', newMessage);
    await sendChatMessage(orderId, {
      senderId: currentUser.id,
      receiverId: chatPartnerId,
      message: newMessage.trim(),
      orderId,
    });

    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser) {
    return <div>Please log in to use the chat</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-food-green text-white">
                {chatPartner ? chatPartner.name.charAt(0).toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">
                Chat with {chatPartner?.name || 'Manager'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Order #{orderId} - {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>
          <Badge variant={
            order.status === 'pending' ? 'outline' :
              order.status === 'confirmed' ? 'secondary' :
                order.status === 'preparing' ? 'default' :
                  order.status === 'ready' ? 'default' : 'outline'
          }>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] overflow-y-auto p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isSender = msg.senderId === currentUser.id;
                const sender = userCache[msg.senderId];

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isSender ? 'bg-food-orange text-white' : 'bg-gray-100'} rounded-xl p-3`}>
                      <div className="flex items-start gap-2">
                        {!isSender && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={isSender ? 'bg-food-orange text-white' : 'bg-food-green text-white'}>
                              {sender ? sender.name.charAt(0).toUpperCase() : '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-medium ${isSender ? 'text-white/90' : 'text-gray-500'}`}>
                              {isSender ? 'You' : sender?.name || 'Unknown'}
                            </p>
                            <p className={`text-xs ${isSender ? 'text-white/70' : 'text-gray-400'} ml-2`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                          <p className={`mt-1 ${isSender ? 'text-white' : 'text-gray-800'}`}>
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-3">
        <form onSubmit={handleSendMessage} className="w-full flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (newMessage.trim()) {
                  handleSendMessage(e)
                }
              }
            }}
            placeholder={`Message ${chatPartner?.name || 'the restaurant'}...`}
            className="flex-1 resize-none h-10 py-2"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-food-orange hover:bg-orange-600"
          >
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
