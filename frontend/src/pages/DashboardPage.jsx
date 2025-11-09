import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import SearchBar from '../components/dashboard/SearchBar';
import ConversationList from '../components/dashboard/ConversationList';
import { conversationAPI } from '../services/api';
import { debounce } from '../utils/helpers';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadConversations();
  }, [filters]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);

      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.start_date) params.date_from = filters.start_date;
      if (filters.end_date) params.date_to = filters.end_date;


      const data = await conversationAPI.getAll(params);
      setConversations(data.results || data);
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = debounce((searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  }, 500);

  const handleFilterChange = ({ status, start_date, end_date }) => {
    setFilters((prev) => ({
      ...prev,
      status,
      start_date,
      end_date,
    }));
  };

  const handleDeleted = (id) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
  };

  const handleUpdated = (updatedConv) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Conversations Dashboard
          </h1>
        </div>
        <p className="text-gray-600">
          View and manage all your AI conversations in one place
        </p>
      </div>

      {/* Search & Filters */}
      <SearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Conversations</div>
          <div className="text-2xl font-bold text-gray-900">
            {conversations.length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-blue-600">
            {conversations.filter((c) => c.status === 'active').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Ended</div>
          <div className="text-2xl font-bold text-gray-600">
            {conversations.filter((c) => c.status === 'ended').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Messages</div>
          <div className="text-2xl font-bold text-purple-600">
            {conversations.reduce(
              (sum, c) => sum + (c.message_count || 0),
              0
            )}
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <ConversationList
        conversations={conversations}
        isLoading={isLoading}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </div>
  );
};

export default DashboardPage;
