
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from '../../utils/types';
import { addChatMessage, getChatHistoryByOrderId } from '../../data/chatMessages';
import { getOrdersByCustomerId } from '../../backend/order';
import { users } from '../../data/users';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChatInterfaceProps {
  orderId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ orderId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  
  // 🔄 Load specific order by orderId
  useEffect(() => {
    const loadOrder = async () => {
      if (!currentUser) return;
      try {
        const customerOrders = await getOrdersByCustomerId(currentUser.id);
        const foundOrder = customerOrders.find((o) => o.id === orderId);
        setOrder(foundOrder || null);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setOrder(null);
      }
    };

    loadOrder();
  }, [currentUser, orderId]);
  
  // Determine the chat partner based on current user
  const chatPartnerId = currentUser?.role === 'customer' 
    ? '2' // Owner's ID for customer
    : order?.customerId || ''; // Customer's ID for owner
    
  const chatPartner = users.find(user => user.id === chatPartnerId);

  useEffect(() => {
    // Load chat history
    const loadChatHistory = () => {
      setLoading(true);
      try {
        const history = getChatHistoryByOrderId(orderId);
        setMessages(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChatHistory();
    
    // Simulate "real-time" updates with interval
    const intervalId = setInterval(() => {
      const updatedHistory = getChatHistoryByOrderId(orderId);
      if (updatedHistory.length !== messages.length) {
        setMessages(updatedHistory);
      }
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [orderId]);
  
  useEffect(() => {
    // Scroll to bottom of chat when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser) return;
    
    // Create a new message
    addChatMessage({
      senderId: currentUser.id,
      receiverId: chatPartnerId,
      message: newMessage.trim(),
      orderId: orderId,
    });
    
    // Update the local state
    setMessages([
      ...messages,
      {
        id: (messages.length + 1).toString(),
        senderId: currentUser.id,
        receiverId: chatPartnerId,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        orderId: orderId,
      },
    ]);
    
    // Clear the input
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
            {order.status}
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
                const sender = users.find(user => user.id === msg.senderId);
                
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
