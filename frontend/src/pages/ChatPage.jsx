import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Edit2, Check, X } from 'lucide-react';
import ChatInterface from '../components/chat/ChatInterface';
import { conversationAPI } from '../services/api';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState(id || null);
  const [isEnding, setIsEnding] = useState(false);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (conversationId) {
      loadConversationInfo();
    } else {
      setConversationInfo(null);
    }
  }, [conversationId]);

  useEffect(() => {
    const handleTitleUpdate = (event) => {
      if (event.detail.id === conversationId) {
        setConversationInfo(prev => ({
          ...prev,
          title: event.detail.title
        }));
      }
    };

    window.addEventListener('conversationTitleUpdated', handleTitleUpdate);
    return () => {
      window.removeEventListener('conversationTitleUpdated', handleTitleUpdate);
    };
  }, [conversationId]);

  const loadConversationInfo = async () => {
    try {
      const data = await conversationAPI.get(conversationId);
      setConversationInfo(data);
    } catch (error) {
      console.error('Failed to load conversation info:', error);
    }
  };

  const handleConversationCreated = (newId) => {
    setConversationId(newId);
    navigate(`/chat/${newId}`, { replace: true });
    loadConversationInfo();
  };

  const handleEndConversation = async () => {
    if (!conversationId) {
      toast.error('No active conversation to end');
      return;
    }

    if (!confirm('Are you sure you want to end this conversation? AI will generate a summary.')) {
      return;
    }

    try {
      setIsEnding(true);
      await conversationAPI.end(conversationId);
      toast.success('Conversation ended successfully! Summary generated.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to end conversation');
    } finally {
      setIsEnding(false);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setConversationInfo(null);
    navigate('/chat');
  };

  const handleEditTitle = () => {
    setEditedTitle(conversationInfo?.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    try {
      // 🎯 FIX: Use correct PATCH format
      await conversationAPI.updateTitle(conversationId, { title: editedTitle });
      setConversationInfo(prev => ({ ...prev, title: editedTitle }));
      setIsEditingTitle(false);
      toast.success('Title updated!');
      
      // Reload conversation to get updated data
      loadConversationInfo();
    } catch (error) {
      toast.error('Failed to update title');
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {conversationInfo ? (
            isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 max-w-md"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {conversationInfo.title === 'New Conversation' ? (
                      <span className="text-gray-400 italic">
                        New Conversation (auto-generating...)
                      </span>
                    ) : (
                      conversationInfo.title
                    )}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {conversationInfo.message_count} messages
                  </p>
                </div>
                {conversationInfo.title !== 'New Conversation' && (
                  <button
                    onClick={handleEditTitle}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit title"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">Chat with AI</h1>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleNewConversation}
            className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            New Chat
          </button>

          {conversationId && (
            <button
              onClick={handleEndConversation}
              disabled={isEnding}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2"
            >
              {isEnding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Ending...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  End Conversation
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <ChatInterface
        conversationId={conversationId}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
};

export default ChatPage;