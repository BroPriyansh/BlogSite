import { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';
import { Label } from './components/ui/label';
import { Edit, Save, Upload, Clock, Pen, BookOpen, Mail, Twitter, Linkedin, Github, Menu, User, Calendar, Star, LogOut, LogIn, UserPlus } from "lucide-react";
import ArticleView from './components/ArticleView';
import AuthModal from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { getPosts, createPost, updatePost } from './services/postsService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

function App() {

  
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [filter, setFilter] = useState('all');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const { currentUser, logout, loading: authLoading } = useAuth();

  // Initialize with example posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postsData = await getPosts();
        if (postsData.length === 0) {
          // Add example posts if no posts exist
          const examplePosts = [
            {
              id: '1',
              title: 'Getting Started with React Development',
              content: `React has revolutionized the way we build user interfaces. In this comprehensive guide, we'll explore the fundamentals of React development, from setting up your first project to building complex applications.

## What is React?

React is a JavaScript library for building user interfaces, particularly single-page applications. It's used for handling the view layer and can be used for developing both web and mobile applications.

## Key Features

- **Component-Based**: React applications are built using reusable components
- **Virtual DOM**: React uses a virtual DOM for efficient rendering
- **JSX**: A syntax extension that allows you to write HTML-like code in JavaScript
- **Unidirectional Data Flow**: Data flows down from parent to child components

## Setting Up Your First React Project

To get started with React, you can use Create React App:

\`\`\`bash
npx create-react-app my-app
cd my-app
npm start
\`\`\`

This will create a new React project with all the necessary dependencies and start the development server.

## Understanding Components

Components are the building blocks of React applications. Here's a simple example:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

## State and Props

Props are used to pass data from parent to child components, while state is used for data that can change over time within a component.

\`\`\`jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}
\`\`\`

## Best Practices

1. **Keep components small and focused**
2. **Use functional components with hooks when possible**
3. **Implement proper error boundaries**
4. **Optimize performance with React.memo and useMemo**
5. **Follow consistent naming conventions**

## Conclusion

React provides a powerful and flexible way to build modern web applications. By understanding its core concepts and following best practices, you can create maintainable and scalable applications.

Start your React journey today and discover the endless possibilities of modern web development!`,
              excerpt: 'Learn the fundamentals of React development, from setting up your first project to building complex applications with best practices.',
              tags: 'react, javascript, web-development, frontend',
              status: 'published',
              authorId: 'example-user-1',
              authorName: 'Sarah Johnson',
              createdAt: new Date('2024-01-15').getTime(),
              updatedAt: new Date('2024-01-15').getTime()
            },
            {
              id: '2',
              title: 'The Future of Web Development: AI and Automation',
              content: `The landscape of web development is rapidly evolving with the integration of artificial intelligence and automation tools. This transformation is reshaping how we build, deploy, and maintain web applications.

## AI-Powered Development Tools

Modern development environments are becoming increasingly intelligent. AI-powered code completion, automated testing, and intelligent debugging are just the beginning of what's possible.

### Code Generation and Completion

Tools like GitHub Copilot and similar AI assistants are revolutionizing how developers write code. These tools can:
- Suggest complete functions based on comments
- Generate boilerplate code automatically
- Provide context-aware code completions
- Help with documentation and testing

### Automated Testing and Quality Assurance

AI is making testing more efficient and comprehensive:
- Automated test case generation
- Intelligent bug detection and reporting
- Performance optimization suggestions
- Security vulnerability scanning

## The Rise of No-Code and Low-Code Platforms

No-code and low-code platforms are democratizing web development, allowing non-technical users to create sophisticated applications.

### Benefits of No-Code Platforms

1. **Faster Development**: Rapid prototyping and deployment
2. **Reduced Costs**: Lower development and maintenance costs
3. **Accessibility**: Enables more people to create digital solutions
4. **Integration**: Easy connection with existing systems

### Popular Platforms

- **Webflow**: For design-focused websites
- **Bubble**: For complex web applications
- **Airtable**: For database-driven applications
- **Zapier**: For workflow automation

## The Impact on Traditional Development

While AI and automation are transforming the industry, traditional development skills remain valuable:

### What's Changing

- **Routine tasks** are being automated
- **Code generation** is becoming more intelligent
- **Testing and deployment** are increasingly automated
- **Documentation** is being generated automatically

### What Remains Important

- **Problem-solving skills** are still crucial
- **System design** and architecture knowledge
- **Understanding of fundamentals** (algorithms, data structures)
- **Creativity** and innovation in solution design

## Preparing for the Future

To stay relevant in this evolving landscape, developers should:

1. **Embrace AI tools** and learn to work with them effectively
2. **Focus on high-level skills** like system design and problem-solving
3. **Stay updated** with emerging technologies and trends
4. **Develop soft skills** like communication and collaboration
5. **Learn to integrate** AI tools into existing workflows

## Conclusion

The future of web development is not about replacing developers, but about augmenting their capabilities. The most successful developers will be those who can effectively leverage AI tools while maintaining strong fundamental skills and creative problem-solving abilities.

The key is to view AI as a powerful ally rather than a threat, and to continuously adapt and learn in this rapidly changing field.`,
              excerpt: 'Explore how AI and automation are transforming web development, from code generation to no-code platforms, and what this means for developers.',
              tags: 'ai, automation, web-development, future-tech, no-code',
              status: 'published',
              authorId: 'example-user-2',
              authorName: 'Michael Chen',
              createdAt: new Date('2024-01-20').getTime(),
              updatedAt: new Date('2024-01-20').getTime()
            },
            {
              id: '3',
              title: 'Mastering CSS Grid: A Complete Guide',
              content: `CSS Grid is one of the most powerful layout systems available in modern web development. It provides a two-dimensional layout system that gives you complete control over both rows and columns.

## Understanding CSS Grid Basics

CSS Grid Layout is a two-dimensional layout system designed for the web. It lets you lay out items in rows and columns, and has many features that make building complex layouts straightforward.

### Grid Container and Grid Items

To use CSS Grid, you need to define a grid container and grid items:

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 200px;
  gap: 20px;
}
\`\`\`

### Grid Lines and Grid Tracks

Grid lines are the horizontal and vertical dividing lines of the grid. Grid tracks are the spaces between grid lines.

## Essential Grid Properties

### Grid Template Columns and Rows

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 2fr;
  grid-template-rows: 100px auto 200px;
}
\`\`\`

### The Fr Unit

The fr unit represents a fraction of the available space in the grid container:

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}
\`\`\`

### Grid Gap

The gap property creates space between grid items:

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  /* or */
  row-gap: 20px;
  column-gap: 30px;
}
\`\`\`

## Advanced Grid Techniques

### Grid Areas

Grid areas allow you to create named areas in your grid:

\`\`\`css
.grid {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
\`\`\`

### Responsive Grids

CSS Grid makes responsive design much easier:

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
\`\`\`

## Practical Examples

### Card Layout

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}
\`\`\`

### Holy Grail Layout

\`\`\`css
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 60px;
  min-height: 100vh;
}
\`\`\`

## Browser Support and Fallbacks

CSS Grid is supported in all modern browsers. For older browsers, you can use feature queries:

\`\`\`css
@supports (display: grid) {
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
\`\`\`

## Best Practices

1. **Start simple**: Begin with basic grid layouts
2. **Use meaningful names**: Name your grid areas descriptively
3. **Consider accessibility**: Ensure your grid layout works with screen readers
4. **Test responsiveness**: Always test on different screen sizes
5. **Use the fr unit**: It's perfect for flexible layouts

## Conclusion

CSS Grid is a powerful tool that can simplify complex layouts and make responsive design more intuitive. By mastering its concepts and techniques, you can create sophisticated layouts that were previously difficult or impossible to achieve.

Start experimenting with CSS Grid today and discover how it can transform your approach to web layout!`,
              excerpt: 'Learn how to use CSS Grid to create sophisticated layouts with this comprehensive guide covering everything from basics to advanced techniques.',
              tags: 'css, grid, layout, web-design, responsive',
              status: 'published',
              authorId: 'example-user-3',
              authorName: 'Emily Rodriguez',
              createdAt: new Date('2024-01-25').getTime(),
              updatedAt: new Date('2024-01-25').getTime()
            },
            {
              id: '4',
              title: 'Building a Blog with Modern JavaScript',
              content: `Creating a blog with modern JavaScript involves understanding several key concepts and technologies. This guide will walk you through building a complete blog application from scratch.

## Project Setup

First, let's set up our development environment:

\`\`\`bash
mkdir modern-blog
cd modern-blog
npm init -y
npm install express cors helmet morgan
\`\`\`

## Backend Architecture

### Express.js Server Setup

\`\`\`javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

### Database Integration

For this example, we'll use MongoDB with Mongoose:

\`\`\`javascript
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  tags: [String],
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }
});

const Post = mongoose.model('Post', postSchema);
\`\`\`

## API Endpoints

### RESTful Routes

\`\`\`javascript
// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .sort({ publishedAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
\`\`\`

## Frontend Development

### Modern JavaScript Features

ES6+ features make our code more readable and maintainable:

\`\`\`javascript
// Async/Await for API calls
const fetchPosts = async () => {
  try {
    const response = await fetch('/api/posts');
    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Template literals for dynamic content
const createPostHTML = (post) => {
  return \`
    <article class="post">
      <h2>\${post.title}</h2>
      <p class="author">By \${post.author}</p>
      <div class="content">\${post.content}</div>
      <div class="tags">
        \${post.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('')}
      </div>
    </article>
  \`;
};
\`\`\`

## Advanced Features

### Search and Filtering

\`\`\`javascript
const searchPosts = (posts, query) => {
  return posts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase()) ||
    post.content.toLowerCase().includes(query.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
};

const filterByTag = (posts, tag) => {
  return posts.filter(post => 
    post.tags.includes(tag)
  );
};
\`\`\`

### Pagination

\`\`\`javascript
const paginatePosts = (posts, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    posts: posts.slice(startIndex, endIndex),
    totalPages: Math.ceil(posts.length / limit),
    currentPage: page
  };
};
\`\`\`

## Performance Optimization

### Lazy Loading

\`\`\`javascript
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
};
\`\`\`

### Caching Strategies

\`\`\`javascript
const cachePosts = (posts) => {
  localStorage.setItem('blog_posts', JSON.stringify({
    data: posts,
    timestamp: Date.now()
  }));
};

const getCachedPosts = () => {
  const cached = localStorage.getItem('blog_posts');
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Cache for 1 hour
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  }
  return null;
};
\`\`\`

## Deployment

### Environment Configuration

\`\`\`javascript
// config.js
const config = {
  development: {
    database: 'mongodb://localhost:27017/blog_dev',
    port: 3000
  },
  production: {
    database: process.env.MONGODB_URI,
    port: process.env.PORT
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
\`\`\`

## Conclusion

Building a modern blog with JavaScript involves understanding both backend and frontend technologies. By using modern JavaScript features, proper architecture, and performance optimization techniques, you can create a robust and scalable blog application.

The key is to start simple and gradually add features as your understanding grows. Modern JavaScript provides all the tools you need to build sophisticated web applications!`,
              excerpt: 'Learn how to build a complete blog application using modern JavaScript, from backend setup to frontend development and deployment.',
              tags: 'javascript, nodejs, express, mongodb, web-development',
              status: 'draft',
              authorId: 'example-user-1',
              authorName: 'Sarah Johnson',
              createdAt: new Date('2024-01-30').getTime(),
              updatedAt: new Date('2024-01-30').getTime()
            }
          ];
          
          // Add example posts to Firestore
          for (const post of examplePosts) {
            const { title, content, tags, status } = post;
            await createPost({ title, content, tags, status }, 'example-user', 'Example Author');
          }
          
          // Load posts after adding examples
          const updatedPosts = await getPosts();
          setPosts(updatedPosts);
        } else {
          setPosts(postsData);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    loadPosts();
  }, []);

  const savePost = useCallback(async (post) => {
    if (!currentUser) {
      alert('Please log in to create or edit posts');
      return;
    }

    setIsSaving(true);
    
    try {
      if (post.id) {
        // Check if user owns this post
        const existingPost = posts.find(p => p.id === post.id);
        if (existingPost && existingPost.authorId !== currentUser.uid) {
          alert('You can only edit your own posts');
          setIsSaving(false);
          return;
        }

        // Update existing post in Firestore
        await updatePost(post.id, post);
        
        // Update local state
        const updatedPosts = posts.map(p => 
          p.id === post.id ? { ...p, ...post } : p
        );
        setPosts(updatedPosts);
      } else {
        // Create new post in Firestore
        const newPost = await createPost(post, currentUser.uid, currentUser.name);
        setPosts([newPost, ...posts]);
      }
      
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Error saving post:', error);
      
      // Fallback to local storage if Firestore fails
      try {
        const now = new Date().toISOString();
        if (post.id) {
          const updatedPosts = posts.map(p => 
            p.id === post.id ? { ...p, ...post, updatedAt: now } : p
          );
          setPosts(updatedPosts);
        } else {
          const newPost = {
            ...post,
            id: Date.now().toString(),
            updatedAt: now,
            excerpt: post.content.substring(0, 100) + '...',
            authorId: currentUser.uid,
            authorName: currentUser.name
          };
          setPosts([newPost, ...posts]);
        }
        setLastSaved(now);
        alert('Post saved locally (Firestore unavailable)');
      } catch (fallbackError) {
        console.error('Fallback save failed:', fallbackError);
        alert('Error saving post. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }, [posts, currentUser]);

  // Auto-save functionality
  useEffect(() => {
    if (!title && !content) return;
    
    const inactivityTimer = setTimeout(() => {
      if (title || content) {
        handleSaveDraft();
      }
    }, 5000);
    
    const intervalTimer = setInterval(() => {
      if (title || content) {
        handleSaveDraft();
      }
    }, 30000);
    
    return () => {
      clearTimeout(inactivityTimer);
      clearInterval(intervalTimer);
    };
  }, [title, content, tags]);

  const handleSaveDraft = async () => {
    if (!title && !content) return;
    
    await savePost({
      id: currentPost?.id,
      title,
      content,
      tags,
      status: 'draft'
    });
  };

  const handlePublish = async () => {
    if (!title || !content) return;
    
    await savePost({
      id: currentPost?.id,
      title,
      content,
      tags,
      status: 'published',
      excerpt: content.substring(0, 100) + '...'
    });
    
    setCurrentPost(null);
    setTitle('');
    setContent('');
    setTags('');
  };

  const handleEditPost = (post) => {
    setCurrentPost(post);
    setTitle(post.title);
    setContent(post.content);
    setTags(post.tags);
    setActiveTab('editor');
  };

  const handleViewPost = (post) => {
    setViewingPost(post);
    setActiveTab('article');
  };

  const handleBackFromArticle = () => {
    setViewingPost(null);
    setActiveTab('list');
  };

  const handleNewPost = () => {
    if (authLoading) {
      return; // Don't do anything while loading
    }
    
    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    setActiveTab('editor');
    setCurrentPost(null);
    setTitle('');
    setContent('');
    setTags('');
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Test Firestore connectivity
  const testFirestore = async () => {
    try {
      console.log('Testing Firestore connectivity...');
      const testDoc = await addDoc(collection(db, 'test'), {
        test: true,
        timestamp: serverTimestamp()
      });
      console.log('Firestore test successful:', testDoc.id);
      return true;
    } catch (error) {
      console.error('Firestore test failed:', error);
      return false;
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const featuredPosts = posts.filter(post => post.featured);
  const publishedPosts = posts.filter(post => post.status === 'published');
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Loading Screen */}
      {authLoading && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Checking authentication status</p>
          </div>
        </div>
      )}

      {/* Main App Content */}
      {!authLoading && (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Pen className="w-6 h-6 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">WriteMind</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button 
                  onClick={() => setActiveTab('home')}
                  className={`${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 font-medium`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setActiveTab('list')}
                  className={`${activeTab === 'list' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 font-medium`}
                >
                  Blog
                </button>
                <a href="#about" className="text-gray-500 hover:text-indigo-600 font-medium">About</a>
                <a href="#contact" className="text-gray-500 hover:text-indigo-600 font-medium">Contact</a>
              </nav>
              <Button 
                variant="outline" 
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden md:flex items-center space-x-4">
                {currentUser ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {currentUser.avatar}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleNewPost}
                    >
                      New Post
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={logout}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={testFirestore}
                      className="text-gray-500 hover:text-gray-700"
                      title="Test Firestore"
                    >
                      🔧
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-grow">
            {/* Hero Section */}
            {activeTab === 'home' && (
              <section className="relative bg-gradient-to-br from-indigo-50 to-blue-100 py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOEMwIDEyLjQyIDMuNTggMTYgOCAxNkMxMi40MiAxNiAxNiAxMi40MiAxNiA4QzE2IDMuNTggMTIuNDIgMCA4IDBaTTggMTVDNC4xNCAxNSAxIDExLjg2IDEgOEMxIDQuMTQgNC4xNCAxIDggMUMxMS44NiAxIDE1IDQuMTQgMTUgOEMxNSAxMS44NiAxMS44NiAxNSA4IDE1WiIgZmlsbD0iIzRDNThGQiIvPgo8L3N2Zz4=')]"></div>
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Write, Publish & <span className="text-indigo-600">Share</span> Your Ideas
                  </h1>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    A beautiful platform for writers to create content, build an audience, and share their knowledge with the world.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      size="lg"
                      onClick={handleNewPost}
                      className="px-8 py-4 text-lg"
                    >
                      Start Writing Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="px-8 py-4 text-lg"
                      onClick={() => setActiveTab('list')}
                    >
                      Explore Articles
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* Features Section */}
            {activeTab === 'home' && (
              <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose WriteMind?</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Everything you need to create and share your content with the world
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                          <Pen className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle>Beautiful Editor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Focus on writing with our distraction-free editor that automatically saves your work.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                          <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle>Built-in Audience</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Reach thousands of readers who are interested in your topics and expertise.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                          <Star className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle>Monetization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Earn money from your writing through our partner program and sponsorships.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            )}

            {/* Featured Posts Section */}
            {activeTab === 'home' && featuredPosts.length > 0 && (
              <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Articles</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Discover some of our most popular content
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredPosts.map(post => (
                      <Card key={post.id} className="hover:shadow-lg transition-all h-full flex flex-col">
                        <CardHeader>
                          <div className="flex items-center space-x-2 text-sm text-indigo-600 mb-2">
                            <BookOpen className="w-4 h-4" />
                            <span>{post.tags.split(',')[0].trim()}</span>
                          </div>
                          <CardTitle className="text-xl">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-gray-600 mb-4">{post.excerpt}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="link" 
                            className="px-0 text-indigo-600"
                            onClick={() => handleViewPost(post)}
                          >
                            Read Article →
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  <div className="text-center mt-12">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setActiveTab('list')}
                    >
                      View All Articles
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* About Section */}
            {activeTab === 'home' && (
              <section id="about" className="py-16 bg-white">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 md:h-96"></div>
                    </div>
                    <div className="md:w-1/2">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">About WriteMind</h2>
                      <p className="text-gray-600 mb-4">
                        WriteMind was founded in 2023 with a simple mission: to create the best platform for writers to share their knowledge and ideas with the world.
                      </p>
                      <p className="text-gray-600 mb-6">
                        We believe everyone has valuable insights to share, and we're building tools to make publishing accessible to all - from hobby bloggers to professional writers.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="bg-indigo-100 p-2 rounded-full mr-4">
                            <Pen className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">For Writers</h3>
                            <p className="text-gray-600">Focus on writing while we handle the rest</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-indigo-100 p-2 rounded-full mr-4">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">For Readers</h3>
                            <p className="text-gray-600">Discover quality content on topics you care about</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Newsletter Section */}
            {activeTab === 'home' && (
              <section className="py-16 bg-indigo-600 text-white">
                <div className="container mx-auto px-4 text-center">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
                    <p className="text-xl text-indigo-100 mb-8">
                      Get the latest articles and writing tips delivered to your inbox
                    </p>
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                      <Input
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-grow py-4 px-6 text-gray-900"
                      />
                      <Button 
                        type="submit" 
                        size="lg"
                        className="py-4 px-8 text-lg"
                      >
                        Subscribe
                      </Button>
                    </form>
                    {isSubscribed && (
                      <div className="mt-4 bg-indigo-700 text-indigo-100 p-4 rounded-lg">
                        Thanks for subscribing! Check your email for confirmation.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Article View */}
            {activeTab === 'article' && viewingPost && (
              <ArticleView 
                post={viewingPost}
                allPosts={posts}
                onBack={handleBackFromArticle}
                onViewPost={handleViewPost}
              />
            )}

            {/* Editor or Blog List Content */}
            {(activeTab === 'editor' || activeTab === 'list') && (
              <>
                {/* Redirect to login if trying to access editor without being logged in */}
                {activeTab === 'editor' && !currentUser && !authLoading && (
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-md mx-auto p-8">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Pen className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to Create Posts</h2>
                      <p className="text-gray-600 mb-8">
                        You need to be logged in to create and edit blog posts. Please sign in or create an account to continue.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                          onClick={() => {
                            setAuthMode('login');
                            setShowAuthModal(true);
                          }}
                          className="px-6 py-3"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setAuthMode('register');
                            setShowAuthModal(true);
                          }}
                          className="px-6 py-3"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Sign Up
                        </Button>
                      </div>
                      <Button 
                        variant="ghost"
                        onClick={() => setActiveTab('list')}
                        className="mt-6"
                      >
                        ← Back to Blog
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Show editor only if user is logged in */}
                {activeTab === 'editor' && currentUser && (
                  <section className="py-12 bg-gray-50">
                    <div className="container mx-auto px-4">
                      <div className="max-w-4xl mx-auto">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{currentPost ? 'Edit Post' : 'New Post'}</span>
                              {lastSaved && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Saved {new Date(lastSaved).toLocaleTimeString()}
                                </div>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your blog title"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="content">Content</Label>
                              <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your blog content here..."
                                className="min-h-[200px]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="tags">Tags (comma separated)</Label>
                              <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="technology, programming, react"
                              />
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={handleSaveDraft}
                              disabled={isSaving || (!title && !content)}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {isSaving ? 'Saving...' : 'Save Draft'}
                            </Button>
                            <Button
                              onClick={handlePublish}
                              disabled={isSaving || !title || !content}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isSaving ? 'Publishing...' : 'Publish'}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </div>
                  </section>
                )}

                {/* Show blog list */}
                {activeTab === 'list' && (
                  <section className="py-12 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
                    <div className="container mx-auto px-4">
                      <div className="max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-12">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {filter === 'all' ? 'All Posts' : filter === 'drafts' ? 'Drafts' : 'Published Posts'}
                              </h1>
                              <p className="text-lg text-gray-600">
                                {filter === 'all' 
                                  ? 'Discover articles from our community of writers' 
                                  : filter === 'drafts' 
                                    ? 'Your work in progress' 
                                    : 'Published articles ready to read'
                                }
                              </p>
                            </div>
                            
                            {/* Filter Buttons */}
                            <div className="flex items-center space-x-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                              <Button 
                                variant={filter === 'all' ? 'default' : 'ghost'} 
                                size="sm"
                                onClick={() => setFilter('all')}
                                className="rounded-lg"
                              >
                                All
                              </Button>
                              <Button 
                                variant={filter === 'drafts' ? 'default' : 'ghost'} 
                                size="sm"
                                onClick={() => setFilter('drafts')}
                                className="rounded-lg"
                              >
                                Drafts
                              </Button>
                              <Button 
                                variant={filter === 'published' ? 'default' : 'ghost'} 
                                size="sm"
                                onClick={() => setFilter('published')}
                                className="rounded-lg"
                              >
                                Published
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                          {/* Main Content Area */}
                          <div className="lg:w-2/3">
                            {filteredPosts.length === 0 ? (
                              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardContent className="py-16 text-center">
                                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-10 h-10 text-indigo-600" />
                                  </div>
                                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                    {filter === 'all' 
                                      ? 'No posts found' 
                                      : filter === 'drafts' 
                                        ? 'No drafts yet' 
                                        : 'No published posts yet'
                                    }
                                  </h3>
                                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    {filter === 'all' 
                                      ? 'Create your first post to get started!' 
                                      : filter === 'drafts' 
                                        ? 'Start writing to see your drafts here' 
                                        : 'Publish your first article to see it here'
                                    }
                                  </p>
                                  <Button 
                                    className="px-8 py-3 text-lg"
                                    onClick={handleNewPost}
                                  >
                                    <Pen className="w-5 h-5 mr-2" />
                                    Create New Post
                                  </Button>
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="space-y-6">
                                {filteredPosts.map(post => (
                                  <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                                    <div className="p-6">
                                      <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                              post.status === 'published' 
                                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                            }`}>
                                              {post.status}
                                            </span>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                              <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                                              </div>
                                              {post.authorName && (
                                                <div className="flex items-center space-x-1">
                                                  <User className="w-4 h-4" />
                                                  <span>{post.authorName}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                            {post.title}
                                          </h2>
                                          
                                          <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                            {post.excerpt || post.content.substring(0, 150) + '...'}
                                          </p>
                                          
                                          {post.tags && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                              {post.tags.split(',').slice(0, 3).map(tag => (
                                                <span 
                                                  key={tag} 
                                                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
                                                >
                                                  #{tag.trim()}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center space-x-3">
                                          {currentUser && post.authorId === currentUser.uid && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleEditPost(post)}
                                              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                            >
                                              <Edit className="w-4 h-4 mr-2" />
                                              Edit
                                            </Button>
                                          )}
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => post.status === 'published' ? handleViewPost(post) : (currentUser && post.authorId === currentUser.uid ? handleEditPost(post) : null)}
                                          disabled={post.status !== 'published' && (!currentUser || post.authorId !== currentUser.uid)}
                                          className="group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all"
                                        >
                                          {post.status === 'published' ? 'Read Article' : 'Edit'}
                                          <BookOpen className="w-4 h-4 ml-2" />
                                        </Button>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Sidebar */}
                          <div className="lg:w-1/3 space-y-6">
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-xl flex items-center space-x-2">
                                  <Pen className="w-5 h-5 text-indigo-600" />
                                  <span>Create New Post</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                  Share your knowledge and insights with our community. Start writing your next great article.
                                </p>
                                <Button 
                                  className="w-full py-3 text-lg"
                                  onClick={handleNewPost}
                                >
                                  <Pen className="w-5 h-5 mr-2" />
                                  New Post
                                </Button>
                              </CardContent>
                            </Card>

                            {publishedPosts.length > 0 && (
                              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader className="pb-4">
                                  <CardTitle className="text-xl flex items-center space-x-2">
                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                    <span>Popular Tags</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex flex-wrap gap-2">
                                    {Array.from(
                                      new Set(
                                        publishedPosts
                                          .flatMap(post => post.tags?.split(',') || [])
                                          .map(tag => tag.trim())
                                          .filter(tag => tag)
                                      )
                                    )
                                      .slice(0, 10)
                                      .map(tag => (
                                        <Button 
                                          key={tag} 
                                          variant="outline" 
                                          size="sm"
                                          className="rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                          onClick={() => {
                                            setFilter('all');
                                            // Filter posts by tag click
                                            const tagFilteredPosts = posts.filter(post =>
                                              post.tags?.split(',').map(t => t.trim()).includes(tag)
                                            );
                                            setPosts(tagFilteredPosts);
                                          }}
                                        >
                                          #{tag}
                                        </Button>
                                      ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Stats Card */}
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-xl flex items-center space-x-2">
                                  <BookOpen className="w-5 h-5 text-indigo-600" />
                                  <span>Blog Stats</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Posts</span>
                                    <span className="font-semibold text-gray-900">{posts.length}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Published</span>
                                    <span className="font-semibold text-green-600">{posts.filter(p => p.status === 'published').length}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Drafts</span>
                                    <span className="font-semibold text-yellow-600">{posts.filter(p => p.status === 'draft').length}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Auth Modal */}
            <AuthModal 
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              initialMode={authMode}
            />
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Pen className="w-6 h-6 text-indigo-400" />
                    <span className="text-xl font-bold text-white">WriteMind</span>
                  </div>
                  <p className="text-gray-400">
                    A beautiful platform for writers to share their thoughts with the world.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-4">Navigation</h3>
                  <ul className="space-y-2">
                    <li><button onClick={() => setActiveTab('home')} className="hover:text-white">Home</button></li>
                    <li><button onClick={() => setActiveTab('list')} className="hover:text-white">Blog</button></li>
                    <li><a href="#about" className="hover:text-white">About</a></li>
                    <li><a href="#contact" className="hover:text-white">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                  </ul>
                </div>
                <div id="contact">
                  <h3 className="text-white font-medium mb-4">Connect</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white">
                      <Github className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="mt-4 text-gray-400">
                    contact@writemind.com
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} WriteMind. All rights reserved.
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App
