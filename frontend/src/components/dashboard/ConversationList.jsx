import ConversationCard from './ConversationCard';
import { Loader2, Inbox } from 'lucide-react';

const ConversationList = ({ conversations, isLoading, onDeleted, onUpdated }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Inbox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start a new chat to see your conversations here
          </p>
          <a
            href="/chat"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Chatting
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          onDeleted={onDeleted}      
          onUpdated={onUpdated}      
        />
      ))}
    </div>
  );
};

export default ConversationList;
