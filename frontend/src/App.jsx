import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import QueryPage from './pages/QueryPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:id" element={<ChatPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="query" element={<QueryPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;