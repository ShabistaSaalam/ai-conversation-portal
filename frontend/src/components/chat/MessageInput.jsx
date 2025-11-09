import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { validateMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MessageInput = ({ onSend, isLoading, disabled }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateMessage(message);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    onSend(message);
    setMessage('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          style={{ minHeight: '52px', maxHeight: '200px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
          }}
        />
        <button
          type="submit"
          disabled={disabled || isLoading || !message.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="hidden sm:inline">Sending</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;