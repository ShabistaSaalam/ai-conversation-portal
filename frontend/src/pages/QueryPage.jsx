
import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import QueryInterface from '../components/query/QueryInterface';
import QueryResults from '../components/query/QueryResults';
import { conversationAPI } from '../services/api';
import toast from 'react-hot-toast';

const QueryPage = () => {
  const [queryResult, setQueryResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleQuery = async (query) => {
    try {
      setIsLoading(true);
      setQueryResult(null);
      
      const result = await conversationAPI.query({ query });
      setQueryResult(result);
      
      if (!result.relevant_conversations || result.relevant_conversations.length === 0) {
        toast('No relevant conversations found', { icon: '🔍' });
      }
      
    } catch (error) {
      toast.error(error.message || 'Failed to query conversations');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <SearchIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Query Conversations</h1>
        </div>
      </div>
      
      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ask questions in natural language about your conversation history</li>
          <li>• AI uses semantic search to find the most relevant conversations</li>
          <li>• Get intelligent answers based on your actual conversation content</li>
        </ul>
      </div>
      
      {/* Query Interface */}
      <QueryInterface onQuery={handleQuery} isLoading={isLoading} />
      
      {/* Results */}
      {queryResult && (
        <div className="mt-8">
          <QueryResults result={queryResult} />
        </div>
      )}
    </div>
  );
};

export default QueryPage;