import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, Clock, Tag, TrendingUp, Trash2, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatDuration, getSentimentBadgeColor, getStatusColor, truncateText } from '../../utils/helpers';
import { conversationAPI } from '../../services/api';

const ConversationCard = ({ conversation, onDeleted, onUpdated }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title || '');

  const navigate = useNavigate();

  // ✅ Navigate to chat page on clicking the card
  const openConversation = () => {
    navigate(`/chat/${conversation.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await conversationAPI.delete(conversation.id);
      toast.success('Conversation deleted');
      onDeleted?.(conversation.id);
    } catch (err) {
      toast.error(err.message || 'Failed to delete conversation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.stopPropagation();
    if (!newTitle.trim()) return;

    try {
      const res = await conversationAPI.updateTitle(conversation.id, { title: newTitle });
      toast.success('Title updated');
      onUpdated?.(res);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update title');
    }
  };

  return (
    <div
      onClick={openConversation}
      className="relative block bg-white rounded-lg shadow-sm border border-gray-200 p-6 
      hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
    >
      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={handleUpdate} className="p-1 rounded hover:bg-gray-100" title="Save">
              <Check className="w-4 h-4 text-green-600" />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-1 rounded hover:bg-gray-100" title="Cancel">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="p-1 rounded hover:bg-gray-100"
            title="Edit Title"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
        )}

        <button onClick={handleDelete} className="p-1 rounded hover:bg-gray-100" title="Delete Conversation">
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {conversation.title || 'Untitled Conversation'}
          <span className={`mx-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conversation.status)}`}>
            {conversation.status}
          </span>
        </h3>
      </div>

      {/* Summary */}
      {conversation.summary && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{truncateText(conversation.summary, 150)}</p>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(conversation.created_at)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MessageSquare className="h-4 w-4 mr-2" />
          {conversation.message_count} messages
        </div>
        {conversation.duration_minutes && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {formatDuration(conversation.duration_minutes)}
          </div>
        )}
        {conversation.sentiment && (
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-2 text-gray-600" />
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${getSentimentBadgeColor(conversation.sentiment)}`}
            >
              {conversation.sentiment}
            </span>
          </div>
        )}
      </div>

      {/* Topics */}
      {conversation.key_topics && conversation.key_topics.length > 0 && (
        <div className="flex items-start gap-2 pt-3 border-t border-gray-100">
          <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="flex flex-wrap gap-2">
            {conversation.key_topics.slice(0, 3).map((topic, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                {topic}
              </span>
            ))}
            {conversation.key_topics.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                +{conversation.key_topics.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationCard;
