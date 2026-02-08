
const STORAGE_KEYS = {
  LAST_READ: 'writeMind_lastRead',
  LAST_WRITTEN: 'writeMind_lastWritten'
};

/**
 * Saves the tags of the last read post to local storage.
 * @param {Object} post - The post object being read.
 */
export const saveLastRead = (post) => {
  if (!post || !post.tags) return;
  
  const data = {
    id: post.id,
    tags: post.tags.split(',').map(tag => tag.trim().toLowerCase()),
    timestamp: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(data));
};

/**
 * Saves the tags of the last written post to local storage.
 * @param {Object} post - The post object being written (published).
 */
export const saveLastWritten = (post) => {
  if (!post || !post.tags) return;
  
  const data = {
    id: post.id,
    tags: post.tags.split(',').map(tag => tag.trim().toLowerCase()),
    timestamp: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEYS.LAST_WRITTEN, JSON.stringify(data));
};

/**
 * Gets recommended posts based on last read and written history.
 * @param {Array} allPosts - List of all available posts.
 * @param {number} limit - Maximum number of recommendations to return.
 * @returns {Array} - List of recommended posts.
 */
export const getRecommendations = (allPosts, limit = 3) => {
  if (!allPosts || allPosts.length === 0) return [];

  const lastReadStart = localStorage.getItem(STORAGE_KEYS.LAST_READ);
  const lastWrittenStart = localStorage.getItem(STORAGE_KEYS.LAST_WRITTEN);
  
  const lastRead = lastReadStart ? JSON.parse(lastReadStart) : null;
  const lastWritten = lastWrittenStart ? JSON.parse(lastWrittenStart) : null;

  if (!lastRead && !lastWritten) return [];

  const scores = new Map();

  allPosts.forEach(post => {
    // Skip if it's the exact same post as last read/written (optional, but good for discovery)
    if (lastRead && post.id === lastRead.id) return;
    if (lastWritten && post.id === lastWritten.id) return;
    if (post.status !== 'published') return; // Only recommend published posts

    let score = 0;
    const postTags = post.tags ? post.tags.split(',').map(t => t.trim().toLowerCase()) : [];

    // Weight for written tags (higher importance as user created content about it)
    if (lastWritten && lastWritten.tags) {
      const matchCount = postTags.filter(tag => lastWritten.tags.includes(tag)).length;
      score += matchCount * 3; 
    }

    // Weight for read tags
    if (lastRead && lastRead.tags) {
      const matchCount = postTags.filter(tag => lastRead.tags.includes(tag)).length;
      score += matchCount * 1;
    }

    if (score > 0) {
      scores.set(post.id, { post, score });
    }
  });

  // Sort by score descending and take top 'limit'
  const recommended = Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map(item => item.post)
    .slice(0, limit);

  return recommended;
};
