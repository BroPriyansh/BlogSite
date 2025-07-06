// Utility function to safely format dates
export const formatDate = (timestamp, options = {}) => {
  try {
    if (!timestamp) return null;
    
    let date;
    
    // Handle Firestore timestamp
    if (timestamp.toDate) {
      date = timestamp.toDate();
    }
    // Handle regular Date object
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle timestamp number
    else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    }
    // Handle string timestamp
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    else {
      return null;
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Default formatting options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    // Merge with provided options
    const finalOptions = { ...defaultOptions, ...options };
    
    return date.toLocaleDateString('en-US', finalOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

// Format date for display with time
export const formatDateTime = (timestamp) => {
  return formatDate(timestamp, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date for display without time
export const formatDateOnly = (timestamp) => {
  return formatDate(timestamp, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (timestamp) => {
  try {
    if (!timestamp) return null;
    
    let date;
    
    // Handle Firestore timestamp
    if (timestamp.toDate) {
      date = timestamp.toDate();
    }
    // Handle regular Date object
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle timestamp number
    else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    }
    // Handle string timestamp
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    else {
      return null;
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    // If older than a week, return formatted date
    return formatDateOnly(timestamp);
  } catch (error) {
    console.error('Error getting relative time:', error);
    return null;
  }
}; 