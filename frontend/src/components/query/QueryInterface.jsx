import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const QueryInterface = ({ onQuery, isLoading }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    onQuery(query);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ask a question about your conversations
          </label>
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What topics did I discuss last week?"
              rows={4}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50"
            />
            <Sparkles className="absolute top-3 right-3 h-5 w-5 text-blue-600" />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Search Conversations
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default QueryInterface;