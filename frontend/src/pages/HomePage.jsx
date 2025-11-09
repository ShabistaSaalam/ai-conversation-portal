import { Link } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Search, Sparkles, Zap, Brain, TrendingUp } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Engage in seamless conversations with AI powered by Google Gemini',
      link: '/chat',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: LayoutDashboard,
      title: 'Conversations Dashboard',
      description: 'View, search, and manage all your past conversations in one place',
      link: '/dashboard',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: Search,
      title: 'Intelligent Query',
      description: 'Ask questions about your past conversations using natural language',
      link: '/query',
      color: 'text-green-600 bg-green-50',
    },
  ];

  const capabilities = [
    {
      icon: Brain,
      title: 'AI Conversation Analysis',
      description: 'Automatic summarization, topic extraction, and sentiment analysis',
    },
    {
      icon: Zap,
      title: 'Semantic Search',
      description: 'Find relevant conversations using meaning-based search, not just keywords',
    },
    {
      icon: TrendingUp,
      title: 'Conversation Analytics',
      description: 'Track trends, topics, and patterns across your conversation history',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Chat Portal with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              Conversation Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Chat with AI, store conversations, and unlock insights from your discussion history
            using advanced semantic search and intelligent analysis.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              to="/chat"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Start Chatting
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Core Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="group block p-8 bg-gray-50 rounded-xl hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;