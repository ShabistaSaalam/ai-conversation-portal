import { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { conversationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ChatInterface = ({ conversationId, onConversationCreated }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingConversation, setIsFetchingConversation] = useState(false);
  const [conversationStatus, setConversationStatus] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setMessages([]);
      setConversationStatus(null);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setIsFetchingConversation(true);
      const data = await conversationAPI.get(conversationId);

      // ✅ Store conversation status (active/ended)
      setConversationStatus(data.status);

      // ✅ KEEP showing ended chats (NO redirect)
      if (data.status === 'ended') {
        toast('This conversation is read-only.', { icon: '📄' });
      }

      setMessages(data.messages || []);

    } catch (error) {
      toast.error('Failed to load conversation');
      console.error(error);
    } finally {
      setIsFetchingConversation(false);
    }
  };

  const handleSendMessage = async (content) => {
    // ✅ Prevent sending message to ended conversation
    if (conversationStatus === 'ended') {
      toast.error('You cannot send messages to an ended conversation.');
      return;
    }

    try {
      setIsLoading(true);
      
      let currentConversationId = conversationId;

      // Create conversation if doesn't exist
      if (!currentConversationId) {
        const newConversation = await conversationAPI.create({
          title: 'New Conversation',
        });
        currentConversationId = newConversation.id;
        onConversationCreated?.(currentConversationId);
      }

      // 🎯 SHOW USER MESSAGE IMMEDIATELY (Optimistic UI)
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        sender: 'user',
        content: content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // Send to backend
      const response = await conversationAPI.sendMessage(currentConversationId, content);

      // 🎯 REPLACE temp message with real one and add AI response
      setMessages((prev) => {
        const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [
          ...withoutTemp,
          response.user_message,
          response.ai_message,
        ];
      });

      // Title auto-update logic you already had
      const totalMessages = messages.length + 2;
      
      if (totalMessages >= 4 && totalMessages <= 6) {
        setTimeout(async () => {
          try {
            const updatedConv = await conversationAPI.get(currentConversationId);
            
            if (updatedConv.title && updatedConv.title !== 'New Conversation') {
              window.dispatchEvent(new CustomEvent('conversationTitleUpdated', {
                detail: { 
                  id: currentConversationId, 
                  title: updatedConv.title 
                }
              }));
              
              toast.success('Conversation title generated!', { icon: '✨' });
            }
          } catch (err) {
            console.error('Failed to update title:', err);
          }
        }, 2000);
      }

    } catch (error) {
      setMessages((prev) => prev.filter(msg => !msg.id.toString().startsWith('temp-')));
      toast.error(error.message || 'Failed to send message');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-sm border border-gray-200">

      {/* ✅ Banner for ended conversations */}
      {conversationStatus === 'ended' && (
        <div className="bg-yellow-100 text-yellow-900 text-center py-2 text-sm font-medium border-b border-yellow-300">
          This conversation has ended. You can view messages but cannot send new ones.
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a Conversation
              </h3>
              <p className="text-gray-600">
                Ask me anything! Your conversation will be automatically titled after a few messages.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && conversationStatus !== 'ended' && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="typing-indicator flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ✅ Input disabled when conversation ended */}
      <MessageInput
        onSend={handleSendMessage}
        isLoading={isLoading}
        disabled={conversationStatus === 'ended'}
      />
    </div>
  );
};

export default ChatInterface;
