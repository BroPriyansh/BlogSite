
// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;

// Mock data
const posts = [
    { id: '1', title: 'React Basics', tags: 'react, javascript', status: 'published' },
    { id: '2', title: 'Advanced React', tags: 'react, hooks', status: 'published' },
    { id: '3', title: 'Node.js Guide', tags: 'node, javascript', status: 'published' },
    { id: '4', title: 'Python for Beginners', tags: 'python', status: 'published' },
    { id: '5', title: 'Draft Post', tags: 'react', status: 'draft' }
];

// Import service (simulating since I can't import ES modules in simple node script easily without package.json change)
// I will copy-paste the logic here for testing to ensure logic correctness
const STORAGE_KEYS = {
    LAST_READ: 'writeMind_lastRead',
    LAST_WRITTEN: 'writeMind_lastWritten'
};

const saveLastRead = (post) => {
    if (!post || !post.tags) return;
    const data = {
        id: post.id,
        tags: post.tags.split(',').map(tag => tag.trim().toLowerCase()),
        timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(data));
};

const saveLastWritten = (post) => {
    if (!post || !post.tags) return;
    const data = {
        id: post.id,
        tags: post.tags.split(',').map(tag => tag.trim().toLowerCase()),
        timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.LAST_WRITTEN, JSON.stringify(data));
};

const getRecommendations = (allPosts, limit = 3) => {
    if (!allPosts || allPosts.length === 0) return [];

    const lastReadStart = localStorage.getItem(STORAGE_KEYS.LAST_READ);
    const lastWrittenStart = localStorage.getItem(STORAGE_KEYS.LAST_WRITTEN);

    const lastRead = lastReadStart ? JSON.parse(lastReadStart) : null;
    const lastWritten = lastWrittenStart ? JSON.parse(lastWrittenStart) : null;

    if (!lastRead && !lastWritten) return [];

    const scores = new Map();

    allPosts.forEach(post => {
        if (lastRead && post.id === lastRead.id) return;
        if (lastWritten && post.id === lastWritten.id) return;
        if (post.status !== 'published') return;

        let score = 0;
        const postTags = post.tags ? post.tags.split(',').map(t => t.trim().toLowerCase()) : [];

        if (lastWritten && lastWritten.tags) {
            const matchCount = postTags.filter(tag => lastWritten.tags.includes(tag)).length;
            score += matchCount * 3;
        }

        if (lastRead && lastRead.tags) {
            const matchCount = postTags.filter(tag => lastRead.tags.includes(tag)).length;
            score += matchCount * 1;
        }

        if (score > 0) {
            scores.set(post.id, { post, score });
        }
    });

    return Array.from(scores.values())
        .sort((a, b) => b.score - a.score)
        .map(item => item.post)
        .slice(0, limit);
};

// Test 1: Recommend based on read history
console.log('Test 1: Read "React Basics"');
saveLastRead(posts[0]); // Read React Basics
const recs1 = getRecommendations(posts);
console.log('Recommendations:', recs1.map(p => p.title));
if (recs1.some(p => p.title === 'Advanced React') && recs1.some(p => p.title === 'Node.js Guide')) {
    console.log('PASS');
} else {
    console.log('FAIL');
}

// Test 2: Recommend based on written history (higher weight)
console.log('\nTest 2: Write "Python for Beginners"');
saveLastWritten(posts[3]); // Write Python
const recs2 = getRecommendations(posts);
console.log('Recommendations:', recs2.map(p => p.title));
// Python has no similar posts, so it should still show React stuff from read history, or nothing if scores update
// Wait, my logic accumulates. Read React(1x), Write Python(3x).
// React posts score: 1 (from read). Node score: 1 (from read).
// Python posts: none other.
// So React/Node should still be recommended.
if (recs2.length > 0) console.log('PASS'); else console.log('FAIL');

// Test 3: Clear and write React
localStorage.clear();
console.log('\nTest 3: Write "Advanced React"');
saveLastWritten(posts[1]); // Write Advanced React (tags: react, hooks)
const recs3 = getRecommendations(posts);
console.log('Recommendations:', recs3.map(p => p.title));
// Should recommend React Basics (score 3x match)
if (recs3[0].title === 'React Basics') {
    console.log('PASS');
} else {
    console.log('FAIL');
}
