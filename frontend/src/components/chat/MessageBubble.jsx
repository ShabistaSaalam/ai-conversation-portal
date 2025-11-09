
import { User, Bot } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'} message-enter`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className={`text-xs text-gray-500 mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatRelativeTime(message.timestamp)}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;