import { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';
import { Label } from './components/ui/label';
import { Edit, Save, Upload, Clock, Pen, BookOpen, Mail, Twitter, Linkedin, Github, Menu, User, Calendar, Star } from "lucide-react";

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

  // Initialize with sample data
  useEffect(() => {
    const samplePosts = [
      {
        id: '1',
        title: 'Getting Started with React',
        content: 'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components...',
        tags: 'react, javascript, frontend',
        status: 'published',
        updatedAt: new Date().toISOString(),
        excerpt: 'Learn the fundamentals of React and how to build your first application',
        featured: true
      },
      {
        id: '2',
        title: 'Mastering TypeScript',
        content: 'TypeScript brings static typing to JavaScript, helping you catch errors early and write more maintainable code...',
        tags: 'typescript, javascript',
        status: 'published',
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        excerpt: 'Take your JavaScript skills to the next level with TypeScript',
        featured: true
      },
      {
        id: '3',
        title: 'The Future of Web Development',
        content: 'Web development is constantly evolving with new frameworks, tools, and best practices emerging regularly...',
        tags: 'webdev, trends',
        status: 'draft',
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        excerpt: 'Exploring the latest trends in web development'
      }
    ];
    setPosts(samplePosts);
  }, []);

  const savePost = useCallback(async (post) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
        excerpt: post.content.substring(0, 100) + '...'
      };
      setPosts([...posts, newPost]);
    }
    setIsSaving(false);
    setLastSaved(now);
    return Promise.resolve();
  }, [posts]);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
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
          <div className="hidden md:block">
            <Button 
              onClick={() => {
                setActiveTab('editor');
                setCurrentPost(null);
                setTitle('');
                setContent('');
                setTags('');
              }}
            >
              New Post
            </Button>
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
                  onClick={() => setActiveTab('editor')}
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
                        onClick={() => handleEditPost(post)}
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

        {/* Editor or Blog List Content */}
        {(activeTab === 'editor' || activeTab === 'list') && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              {activeTab === 'editor' ? (
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
              ) : (
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="md:w-2/3">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {filter === 'all' ? 'All Posts' : filter === 'drafts' ? 'Drafts' : 'Published Posts'}
                        </h2>
                        <div className="flex space-x-2">
                          <Button 
                            variant={filter === 'all' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setFilter('all')}
                          >
                            All
                          </Button>
                          <Button 
                            variant={filter === 'drafts' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setFilter('drafts')}
                          >
                            Drafts
                          </Button>
                          <Button 
                            variant={filter === 'published' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setFilter('published')}
                          >
                            Published
                          </Button>
                        </div>
                      </div>

                      {filteredPosts.length === 0 ? (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <BookOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No posts found
                            </h3>
                            <p className="text-gray-500">
                              {filter === 'all' 
                                ? 'Create your first post to get started!' 
                                : filter === 'drafts' 
                                  ? 'You have no saved drafts' 
                                  : 'No published posts yet'}
                            </p>
                            <Button 
                              className="mt-4"
                              onClick={() => setActiveTab('editor')}
                            >
                              Create New Post
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-6">
                          {filteredPosts.map(post => (
                            <Card key={post.id} className="hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-xl">{post.title}</CardTitle>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    post.status === 'published' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {post.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 space-x-4">
                                  <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                                  {post.tags && (
                                    <div className="flex items-center">
                                      {post.tags.split(',').slice(0, 2).map(tag => (
                                        <span key={tag} className="mr-2 last:mr-0">#{tag.trim()}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-gray-600 line-clamp-2">
                                  {post.excerpt || post.content.substring(0, 100) + '...'}
                                </p>
                              </CardContent>
                              <CardFooter className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditPost(post)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  {post.status === 'published' ? 'View' : 'Edit'}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="md:w-1/3 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Create New Post</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">
                            Start writing your next great article
                          </p>
                          <Button 
                            className="w-full"
                            onClick={() => {
                              setActiveTab('editor');
                              setCurrentPost(null);
                              setTitle('');
                              setContent('');
                              setTags('');
                            }}
                          >
                            New Post
                          </Button>
                        </CardContent>
                      </Card>

                      {publishedPosts.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Popular Tags</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {Array.from(
                                new Set(
                                  publishedPosts
                                    .flatMap(post => post.tags.split(','))
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
                                    className="rounded-full"
                                    onClick={() => {
                                      setFilter('all');
                                      // Filter posts by tag click
                                      const tagFilteredPosts = posts.filter(post =>
                                        post.tags.split(',').map(t => t.trim()).includes(tag)
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
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
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
    </div>
  );
}

export default App
