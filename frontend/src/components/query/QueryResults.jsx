
import { FileText, Calendar, Tag, TrendingUp, Clock } from 'lucide-react';
import { formatDate, formatDuration, getSentimentBadgeColor, truncateText } from '../../utils/helpers';
import ReactMarkdown from 'react-markdown';

const QueryResults = ({ result }) => {
  if (!result) return null;
  const extractCleanAnswer = (text) => {
    if (!text) return "";

    let cleaned = text;

    // 1. Remove tuple structure: anything after the first closing quote
    if (cleaned.includes("',")) {
      cleaned = cleaned.split("',")[0];
    }
    cleaned = cleaned.split(/\[\s*\{/)[0];
    // 2. Remove leading (' or (" 
    cleaned = cleaned.replace(/^ *[\(\[]?['"]/, "");

    // 3. Remove trailing ) or ] or extra quotes
    cleaned = cleaned.replace(/['"\)\]]+$/g, "");

    // 4. Remove “In Conversation…ID...” metadata
    cleaned = cleaned.replace(/In Conversation\s*\d+\s*\[ID:\s*\d+\],?\s*/i, "");

    // 5. Clean leftover parentheses, tuple artifacts
    cleaned = cleaned.replace(/[\(\)]/g, "");

    // 6. Clean weird escaped characters
    cleaned = cleaned.replace(/\\n/g, "\n");

    // 7. Trim final clean text
    return cleaned.trim();
  };


  return (
    <div className="space-y-6">
      {/* AI Response */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Answer</h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{extractCleanAnswer(result.response)}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Query processed in {result.execution_time?.toFixed(2)}s
          </span>
          <span className="text-gray-600">
            {result.relevant_conversations?.length || 0} relevant conversations found
          </span>
        </div>
      </div>

      {/* Relevant Conversations */}
      {result.relevant_conversations && result.relevant_conversations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Relevant Conversations ({result.relevant_conversations.length})
          </h3>

          <div className="space-y-4">
            {result.relevant_conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-base font-semibold text-gray-900 flex-1">
                    {conversation.title || 'Untitled Conversation'}
                  </h4>
                  {conversation.sentiment && (
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getSentimentBadgeColor(conversation.sentiment)}`}>
                      {conversation.sentiment}
                    </span>
                  )}
                </div>

                {conversation.summary && (
                  <p className="text-sm text-gray-600 mb-3">
                    {truncateText(conversation.summary, 200)}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(conversation.created_at)}
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatDuration(conversation.duration_minutes)}
                  </div>

                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {conversation.message_count} messages
                  </div>

                  {conversation.key_topics && conversation.key_topics.length > 0 && (
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      {conversation.key_topics.length} topics
                    </div>
                  )}
                </div>

                {conversation.key_topics && conversation.key_topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {conversation.key_topics.slice(0, 4).map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryResults;


