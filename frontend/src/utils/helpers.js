import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Get sentiment color
 */
export const getSentimentColor = (sentiment) => {
  const colors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
    mixed: 'text-yellow-600 bg-yellow-50',
  };
  return colors[sentiment?.toLowerCase()] || colors.neutral;
};

/**
 * Get sentiment badge color
 */
export const getSentimentBadgeColor = (sentiment) => {
  const colors = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
    mixed: 'bg-yellow-100 text-yellow-800',
  };
  return colors[sentiment?.toLowerCase()] || colors.neutral;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-blue-100 text-blue-800',
    ended: 'bg-gray-100 text-gray-800',
  };
  return colors[status?.toLowerCase()] || colors.active;
};

/**
 * Format duration in minutes
 */
export const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};

/**
 * Debounce function for search
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Generate random conversation title
 */
export const generateConversationTitle = () => {
  const adjectives = ['Quick', 'Deep', 'Casual', 'Important', 'Random'];
  const nouns = ['Chat', 'Discussion', 'Talk', 'Conversation', 'Exchange'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
};

/**
 * Validate message content
 */
export const validateMessage = (content) => {
  if (!content || !content.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (content.length > 10000) {
    return { valid: false, error: 'Message is too long (max 10000 characters)' };
  }
  return { valid: true };
};