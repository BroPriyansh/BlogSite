import { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';
import { Label } from './components/ui/label';
import { Edit, Save, Upload, Clock, Pen, BookOpen, Mail, Instagram, Linkedin, Github, Menu, User, Calendar, Star, LogOut, LogIn, UserPlus, Trash2, Users, Phone, MapPin } from "lucide-react";
import ArticleView from './components/ArticleView';
import AuthModal from './components/AuthModal';
import Notification from './components/Notification';
import Editor from './components/Editor';
import { useAuth } from './contexts/AuthContext';
import { getPosts, createPost, updatePost, deletePost } from './services/postsService';
import { formatDateOnly } from './utils/dateUtils';
import WriteMindLogo from './WriteMind.png';


function App() {

  
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [filter, setFilter] = useState('all');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [notification, setNotification] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);


  const { currentUser, logout, loading: authLoading } = useAuth();

  // Load posts without auto-creating example posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postsData = await getPosts();
        setPosts(postsData);
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    loadPosts();
  }, []);

  const savePost = useCallback(async (post) => {
    console.log('=== SAVE POST FUNCTION CALLED ===');
    console.log('Post data:', post);
    console.log('Image URL in post:', post.imageUrl ? 'Present' : 'Missing');
    
    if (!currentUser) {
      console.error('❌ No current user');
      setNotification({
        message: 'Please log in to create or edit posts',
        type: 'error'
      });
      return;
    }

    console.log('✅ User authenticated, starting save...');
    console.log('User UID for save:', currentUser.uid);
    console.log('User Name for save:', currentUser.name);
    setIsSaving(true);
    
    try {
      if (post.id) {
        console.log('🔄 Updating existing post:', post.id);
        // Check if user owns this post
        const existingPost = posts.find(p => p.id === post.id);
        if (existingPost && existingPost.authorId !== currentUser.uid) {
          console.error('❌ User does not own this post');
          setNotification({
            message: 'You can only edit your own posts',
            type: 'error'
          });
          setIsSaving(false);
          return;
        }

        // Update existing post in Firestore
        console.log('📝 Calling updatePost...');
        await updatePost(post.id, post);
        console.log('✅ Post updated successfully');
        
        // Update local state
        const updatedPosts = posts.map(p => 
          p.id === post.id ? { ...p, ...post } : p
        );
        setPosts(updatedPosts);
      } else {
        console.log('🆕 Creating new post...');
        // Remove undefined id for new posts
        const postWithoutId = { ...post };
        delete postWithoutId.id;
        console.log('Calling createPost with:', { post: postWithoutId, userId: currentUser.uid, userName: currentUser.name });
        
        // Create new post in Firestore
        const newPost = await createPost(postWithoutId, currentUser.uid, currentUser.name);
        console.log('✅ New post created:', newPost);
        setPosts([newPost, ...posts]);
      }
      
      setLastSaved(new Date().toISOString());
      console.log('✅ Save completed successfully');
      setNotification({
        message: 'Post saved successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('❌ Error saving post to Firestore:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      console.log('🔄 Falling back to local storage...');
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
        console.log('✅ Fallback save successful');
        setNotification({
          message: 'Post saved locally (Firestore unavailable)',
          type: 'error'
        });
      } catch (fallbackError) {
        console.error('❌ Fallback save failed:', fallbackError);
        setNotification({
          message: 'Error saving post. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setIsSaving(false);
      console.log('=== SAVE POST FUNCTION COMPLETED ===');
    }
  }, [posts, currentUser]);

  // No auto-save functionality - only save when user leaves or manually saves

  // Handle page unload - save draft when user leaves
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (title || content) {
        // Show confirmation dialog
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        
        // Save draft to localStorage as fallback
        const postData = {
          id: currentPost?.id,
          title,
          content,
          tags,
          imageUrl,
          status: 'draft'
        };
        localStorage.setItem('unsavedDraft', JSON.stringify({
          ...postData,
          timestamp: Date.now()
        }));
        
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [title, content, tags, imageUrl, currentPost]);

  // Check for unsaved draft on component mount
  useEffect(() => {
    const unsavedDraft = localStorage.getItem('unsavedDraft');
    if (unsavedDraft && currentUser) {
      try {
        const draft = JSON.parse(unsavedDraft);
        const draftAge = Date.now() - draft.timestamp;
        
        // Only restore draft if it's less than 24 hours old
        if (draftAge < 24 * 60 * 60 * 1000) {
          setTitle(draft.title || '');
          setContent(draft.content || '');
          setTags(draft.tags || '');
          setImageUrl(draft.imageUrl || '');
          // Don't automatically redirect to editor - let user stay on current page
          // setActiveTab('editor');
        }
        
        // Clear the stored draft
        localStorage.removeItem('unsavedDraft');
      } catch (error) {
        console.error('Error restoring draft:', error);
        localStorage.removeItem('unsavedDraft');
      }
    }
  }, [currentUser]);

  const handleSaveDraft = async () => {
    if (!title && !content) return;
    
    await savePost({
      id: currentPost?.id,
      title,
      content,
      tags,
      imageUrl,
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
      imageUrl,
      status: 'published',
      excerpt: content.substring(0, 100) + '...'
    });
    
    setCurrentPost(null);
    setTitle('');
    setContent('');
    setTags('');
    setImageUrl('');
  };

  const handleEditPost = (post) => {
    setCurrentPost(post);
    setTitle(post.title);
    setContent(post.content);
    setTags(post.tags);
    setImageUrl(post.imageUrl || '');
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
    setImageUrl('');
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Check if current user is admin
  const isAdmin = currentUser?.email === 'memuforpc12@gmail.com';

  const handleDeletePost = async (post) => {
    
    if (!currentUser) {
      setNotification({
        message: 'Please log in to delete posts',
        type: 'error'
      });
      return;
    }

    // Check if user can delete this post
    const canDelete = post.authorId === currentUser.uid || isAdmin;
    
    if (!canDelete) {
      setNotification({
        message: isAdmin ? 'You can only delete posts as admin.' : 'You can only delete your own posts.',
        type: 'error'
      });
      return;
    }

    setDeleteConfirmPost(post);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmPost) return;
    
    try {
      await deletePost(deleteConfirmPost.id);
      setPosts(posts.filter(p => p.id !== deleteConfirmPost.id));
      setNotification({
        message: isAdmin ? 'Post deleted successfully by admin.' : 'Post deleted successfully.',
        type: 'success'
      });
      setDeleteConfirmPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setNotification({
        message: `Failed to delete post: ${error.message}`,
        type: 'error'
      });
      setDeleteConfirmPost(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmPost(null);
  };



  const filteredPosts = posts.filter(post => {
    if (filter === 'all') {
      // Show only published posts in "All Posts" view
      return post.status === 'published';
    }
    
    if (filter === 'drafts') {
      // Only show drafts to their creators
      return post.status === 'draft' && currentUser && post.authorId === currentUser.uid;
    }
    
    if (filter === 'published') {
      // Only show published posts by the current user
      return post.status === 'published' && currentUser && post.authorId === currentUser.uid;
    }
    
    return post.status === filter;
  });


  const publishedPosts = posts.filter(post => post.status === 'published');
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isAdmin && deleteConfirmPost.authorId !== currentUser?.uid ? 'Admin Delete Post' : 'Delete Post'}
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-6">
                {isAdmin && deleteConfirmPost.authorId !== currentUser?.uid ? (
                  <>
                    Are you sure you want to delete "<span className="font-semibold text-gray-900">{deleteConfirmPost.title}</span>" as admin? 
                    <br />
                    <span className="text-sm text-red-600">This action cannot be undone.</span>
                  </>
                ) : (
                  <>
                    Are you sure you want to delete "<span className="font-semibold text-gray-900">{deleteConfirmPost.title}</span>"? 
                    <br />
                    <span className="text-sm text-red-600">This action cannot be undone.</span>
                  </>
                )}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isAdmin && deleteConfirmPost.authorId !== currentUser?.uid ? 'Admin Delete' : 'Delete Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-2 sm:py-3">
              <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <img 
                    src={WriteMindLogo} 
                    alt="WriteMind Logo" 
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
                  />
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex space-x-8">
                  <button 
                    onClick={() => setActiveTab('home')}
                    className={`${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 font-semibold text-base transition-colors py-1 px-2 rounded-lg hover:bg-indigo-50`}
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => setActiveTab('list')}
                    className={`${activeTab === 'list' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 font-semibold text-base transition-colors py-1 px-2 rounded-lg hover:bg-indigo-50`}
                  >
                    Blog
                  </button>
                  <button 
                    onClick={() => setActiveTab('about')}
                    className={`${activeTab === 'about' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 font-semibold text-base transition-colors py-1 px-2 rounded-lg hover:bg-indigo-50`}
                  >
                    About
                  </button>
                  <button 
                    onClick={() => setActiveTab('contact')}
                    className={`${activeTab === 'contact' ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600 font-semibold text-base transition-colors py-1 px-2 rounded-lg hover:bg-indigo-50`}
                  >
                    Contact
                  </button>
                </nav>
                
                {/* Mobile Menu Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                
                {/* Desktop User Actions */}
                <div className="hidden lg:flex items-center space-x-3">
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
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
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
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setAuthMode('register');
                          setShowAuthModal(true);
                        }}
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile Menu */}
              {showMobileMenu && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                  <div className="px-4 py-4 space-y-4">
                    {/* Mobile Navigation */}
                    <nav className="space-y-3">
                      <button 
                        onClick={() => { setActiveTab('home'); setShowMobileMenu(false); }}
                        className={`block w-full text-left py-2 px-3 rounded-lg text-base font-semibold ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        Home
                      </button>
                      <button 
                        onClick={() => { setActiveTab('list'); setShowMobileMenu(false); }}
                        className={`block w-full text-left py-2 px-3 rounded-lg text-base font-semibold ${activeTab === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        Blog
                      </button>
                      <button 
                        onClick={() => { setActiveTab('about'); setShowMobileMenu(false); }}
                        className={`block w-full text-left py-2 px-3 rounded-lg text-base font-semibold ${activeTab === 'about' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        About
                      </button>
                      <button 
                        onClick={() => { setActiveTab('contact'); setShowMobileMenu(false); }}
                        className={`block w-full text-left py-2 px-3 rounded-lg text-base font-semibold ${activeTab === 'contact' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        Contact
                      </button>
                    </nav>
                    
                    {/* Mobile User Actions */}
                    <div className="border-t border-gray-200 pt-4">
                      {currentUser ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                              {currentUser.avatar}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                          </div>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => { handleNewPost(); setShowMobileMenu(false); }}
                          >
                            New Post
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full text-gray-500"
                            onClick={() => { logout(); setShowMobileMenu(false); }}
                          >
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={() => { setAuthMode('login'); setShowAuthModal(true); setShowMobileMenu(false); }}
                          >
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign In
                          </Button>
                          <Button 
                            size="sm"
                            className="w-full"
                            onClick={() => { setAuthMode('register'); setShowAuthModal(true); setShowMobileMenu(false); }}
                          >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Sign Up
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="flex-grow">
            {/* Hero Section */}
            {activeTab === 'home' && (
              <section className="relative bg-gradient-to-br from-indigo-50 to-blue-100 py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOEMwIDEyLjQyIDMuNTggMTYgOCAxNkMxMi40MiAxNiAxNiAxMi40MiAxNiA4QzE2IDMuNTggMTIuNDIgMCA4IDBaTTggMTVDNC4xNCAxNSAxIDExLjg2IDEgOEMxIDQuMTQgNC4xNCAxIDggMUMxMS44NiAxIDE1IDQuMTQgMTUgOEMxNSAxMS44NiAxMS44NiAxNSA4IDE1WiIgZmlsbD0iIzRDNThGQiIvPgo8L3N2Zz4=')]"></div>
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                    Write, Publish & <span className="text-indigo-600">Share</span> Your Ideas
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
                    A beautiful platform for writers to create content, build an audience, and share their knowledge with the world.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                    <Button 
                      size="lg"
                      onClick={handleNewPost}
                      className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                    >
                      Start Writing Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
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
              <section className="py-12 sm:py-16 bg-white">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose WriteMind?</h2>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                      Everything you need to create and share your content with the world
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
            {activeTab === 'home' && posts.filter(post => post.status === 'published').length > 0 && (
              <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Articles</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Discover some of our most popular content
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.filter(post => post.status === 'published').slice(0, 3).map(post => (
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
                            <span>{formatDateOnly(post.updatedAt) || 'Recently'}</span>
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
                        className="py-4 px-8 text-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
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

            {/* About Page */}
            {activeTab === 'about' && (
              <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-indigo-50 to-blue-100 py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOEMwIDEyLjQyIDMuNTggMTYgOCAxNkMxMi40MiAxNiAxNiAxMi40MiAxNiA4QzE2IDMuNTggMTIuNDIgMCA4IDBaTTggMTVDNC4xNCAxNSAxIDExLjg2IDEgOEMxIDQuMTQgNC4xNCAxIDggMUMxMS44NiAxIDE1IDQuMTQgMTUgOEMxNSAxMS44NiAxMS44NiAxNSA4IDE1WiIgZmlsbD0iIzRDNThGQiIvPgo8L3N2Zz4=')]"></div>
                  </div>
                  <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                      About <span className="text-indigo-600">WriteMind</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
                      We're on a mission to democratize publishing and give every writer a platform to share their voice with the world.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                      <Button 
                        size="lg"
                        onClick={handleNewPost}
                        className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                      >
                        Start Writing Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                        onClick={() => setActiveTab('list')}
                      >
                        Explore Articles
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Story Section */}
                <section className="py-16 bg-white">
                  <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            WriteMind was founded in 2023 with a simple mission: to create the best platform for writers to share their knowledge and ideas with the world.
                          </p>
                          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            We believe everyone has valuable insights to share, and we're building tools to make publishing accessible to all - from hobby bloggers to professional writers.
                          </p>
                          <p className="text-lg text-gray-600 leading-relaxed">
                            Our platform combines the simplicity of traditional blogging with the power of modern technology, creating an environment where great content can thrive.
                          </p>
                        </div>
                        <div className="relative">
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 shadow-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-indigo-600 mb-2">2023</div>
                                <div className="text-gray-600">Founded</div>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">100+</div>
                                <div className="text-gray-600">Articles</div>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                                <div className="text-gray-600">Writers</div>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-pink-600 mb-2">10K+</div>
                                <div className="text-gray-600">Readers</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Values Section */}
                <section className="py-16 bg-gray-50">
                  <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                          The principles that guide everything we do
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center border-0 shadow-lg">
                          <CardHeader>
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Pen className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-xl">Quality Content</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 leading-relaxed">
                              We believe in the power of well-crafted content that educates, inspires, and connects people.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="text-center border-0 shadow-lg">
                          <CardHeader>
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Users className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-xl">Community First</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 leading-relaxed">
                              Building a supportive community where writers can grow, learn, and inspire each other.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="text-center border-0 shadow-lg">
                          <CardHeader>
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Star className="w-8 h-8 text-white" />
                            </div>
                            <CardTitle className="text-xl">Innovation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 leading-relaxed">
                              Continuously improving our platform with cutting-edge technology and user-focused design.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Team Section */}
                <section className="py-16 bg-white">
                  <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
                      <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                        A passionate group of writers, developers, and designers working together to build the future of publishing.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="text-center border-0 shadow-lg">
                          <CardHeader>
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <span className="text-2xl font-bold text-white">P</span>
                            </div>
                            <CardTitle>Priyansh</CardTitle>
                            <p className="text-gray-600">Founder & CEO</p>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm">
                              Passionate about creating platforms that empower writers and connect communities.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="text-center border-0 shadow-lg">
                          <CardHeader>
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <span className="text-2xl font-bold text-white">D</span>
                            </div>
                            <CardTitle>Development Team</CardTitle>
                            <p className="text-gray-600">Engineering</p>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm">
                              Building the technology that makes publishing seamless and enjoyable.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="text-center border-0 shadow-lg">
                          <CardHeader>
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <span className="text-2xl font-bold text-white">C</span>
                            </div>
                            <CardTitle>Community</CardTitle>
                            <p className="text-gray-600">Writers & Readers</p>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm">
                              The heart of WriteMind - our amazing community of writers and readers.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
                  <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                      <h2 className="text-3xl font-bold mb-6">Ready to Start Writing?</h2>
                      <p className="text-xl text-indigo-100 mb-8">
                        Join thousands of writers who are already sharing their stories with the world.
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                          onClick={handleNewPost}
                          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg transform hover:scale-105 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Pen className="w-5 h-5 mr-2" />
                          Start Writing
                        </button>
                        <button 
                          onClick={() => setActiveTab('list')}
                          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-indigo-600 text-white hover:bg-white hover:text-indigo-600 shadow-lg transform hover:scale-105 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <BookOpen className="w-5 h-5 mr-2" />
                          Explore Articles
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Contact Page */}
            {activeTab === 'contact' && (
              <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-indigo-50 to-blue-100 py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOEMwIDEyLjQyIDMuNTggMTYgOCAxNkMxMi40MiAxNiAxNiAxMi40MiAxNiA4QzE2IDMuNTggMTIuNDIgMCA4IDBaTTggMTVDNC4xNCAxNSAxIDExLjg2IDEgOEMxIDQuMTQgNC4xNCAxIDggMUMxMS44NiAxIDE1IDQuMTQgMTUgOEMxNSAxMS44NiAxMS44NiAxNSA4IDE1WiIgZmlsbD0iIzRDNThGQiIvPgo8L3N2Zz4=')]"></div>
                  </div>
                  <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                      Get in <span className="text-indigo-600">Touch</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
                      Have questions, suggestions, or just want to say hello? We'd love to hear from you!
                    </p>
                  </div>
                </section>

                {/* Contact Form Section */}
                <section className="py-16 bg-white">
                  <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                          <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                                <Input 
                                  id="firstName" 
                                  type="text" 
                                  placeholder="Your first name"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                                <Input 
                                  id="lastName" 
                                  type="text" 
                                  placeholder="Your last name"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                              <Input 
                                id="email" 
                                type="email" 
                                placeholder="your.email@example.com"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="subject" className="text-gray-700 font-medium">Subject</Label>
                              <Input 
                                id="subject" 
                                type="text" 
                                placeholder="What's this about?"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="message" className="text-gray-700 font-medium">Message</Label>
                              <Textarea 
                                id="message" 
                                placeholder="Tell us what's on your mind..."
                                className="mt-1 min-h-[120px]"
                              />
                            </div>
                            <Button 
                              type="submit" 
                              size="lg"
                              className="w-full sm:w-auto"
                            >
                              <Mail className="w-5 h-5 mr-2" />
                              Send Message
                            </Button>
                          </form>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                                                     <div className="space-y-6">
                             <div className="flex items-start space-x-4">
                               <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                 <Mail className="w-6 h-6 text-indigo-600" />
                               </div>
                               <div>
                                 <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                                 <p className="text-gray-600">priyanshtyagi30@gmail.com</p>
                                 <p className="text-sm text-gray-500">We'll get back to you within 24 hours</p>
                               </div>
                             </div>
                           </div>

                                                     {/* Social Links */}
                           <div className="mt-8 pt-8 border-t border-gray-200">
                             <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                             <div className="flex space-x-4">
                               <a href="https://www.instagram.com/brop1_2/" className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors" target="_blank" rel="noopener noreferrer">
                                 <Instagram className="w-5 h-5" />
                               </a>
                               <a href="https://www.linkedin.com/in/priyansh-tyagi-3972442b0" className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors" target="_blank" rel="noopener noreferrer">
                                 <Linkedin className="w-5 h-5" />
                               </a>
                               <a href="https://github.com/BroPriyansh" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors" target="_blank" rel="noopener noreferrer">
                                 <Github className="w-5 h-5" />
                               </a>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 bg-gray-50">
                  <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600">Find answers to common questions about WriteMind</p>
                      </div>
                      <div className="space-y-6">
                        <Card className="border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg">How do I start writing on WriteMind?</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600">
                              Simply sign up for an account and click "New Post" to start writing. Our editor is designed to be intuitive and distraction-free.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg">Is WriteMind free to use?</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600">
                              Yes! WriteMind is completely free to use. You can create unlimited posts and reach our growing community of readers.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg">Can I monetize my content?</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600">
                              We're working on monetization features. Stay tuned for updates on our partner program and sponsorship opportunities.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Article View */}
            {activeTab === 'article' && viewingPost && (
              <ArticleView 
                post={viewingPost}
                allPosts={posts}
                onBack={handleBackFromArticle}
                onViewPost={handleViewPost}
                currentUser={currentUser}
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
                  <Editor
                    currentPost={currentPost}
                    isSaving={isSaving}
                    lastSaved={lastSaved}
                    title={title}
                    content={content}
                    tags={tags}
                    imageUrl={imageUrl}
                    setTitle={setTitle}
                    setContent={setContent}
                    setTags={setTags}
                    setImageUrl={setImageUrl}
                    handleSaveDraft={handleSaveDraft}
                    handlePublish={handlePublish}
                  />
                )}

                {/* Show blog list */}
                {activeTab === 'list' && (
                  <section className="py-8 sm:py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen relative overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
                    </div>
                    
                    <div className="container mx-auto px-4 relative z-10">
                      <div className="max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-12 sm:mb-16 text-center">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 blur-3xl opacity-20"></div>
                            <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                              {filter === 'all' ? 'Explore Our Blog' : filter === 'drafts' ? 'Your Drafts' : 'Published Articles'}
                            </h1>
                          </div>
                          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {filter === 'all' 
                              ? 'Discover insightful articles, tutorials, and stories from our community of writers' 
                              : filter === 'drafts' 
                                ? 'Your work in progress - continue where you left off' 
                                : 'Published articles ready to inspire and educate'
                            }
                          </p>
                        </div>
                        
                        {/* Filter Buttons */}
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                          {[
                            { key: 'all', label: 'All Posts', icon: BookOpen },
                            { key: 'published', label: 'Published', icon: BookOpen },
                            { key: 'drafts', label: 'Drafts', icon: Pen }
                          ].map(({ key, label, icon: Icon }) => (
                            <Button
                              key={key}
                              variant={filter === key ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setFilter(key)}
                              className={`rounded-full px-6 py-3 transition-all duration-300 ${
                                filter === key 
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105' 
                                  : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border-indigo-200 hover:shadow-md'
                              }`}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {label}
                            </Button>
                          ))}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                          {/* Main Content Area */}
                          <div className="lg:w-2/3">
                            {filteredPosts.length === 0 ? (
                              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden relative">
                                {/* Gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50"></div>
                                <CardContent className="py-20 text-center relative">
                                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                                    <BookOpen className="w-12 h-12 text-indigo-600" />
                                  </div>
                                  <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                    {filter === 'all' 
                                      ? 'No posts found' 
                                      : filter === 'drafts' 
                                        ? 'No drafts yet' 
                                        : 'No published posts yet'
                                    }
                                  </h3>
                                  <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg">
                                    {filter === 'all' 
                                      ? 'Create your first post to get started!' 
                                      : filter === 'drafts' 
                                        ? 'Start writing to see your drafts here' 
                                        : 'Publish your first article to see it here'
                                    }
                                  </p>
                                  <Button 
                                    className="px-10 py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                                    onClick={handleNewPost}
                                  >
                                    <Pen className="w-5 h-5 mr-2" />
                                    Create New Post
                                  </Button>
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="space-y-6 sm:space-y-8">
                                {filteredPosts.map(post => (
                                  <Card key={post.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm overflow-hidden relative">
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative p-6 sm:p-8">
                                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                                        <div className="flex-1">
                                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                                            <span className={`px-4 py-2 rounded-full text-xs font-medium w-fit ${
                                              post.status === 'published' 
                                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 shadow-sm' 
                                                : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200 shadow-sm'
                                            }`}>
                                              {post.status}
                                            </span>
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                                              <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDateOnly(post.updatedAt) || 'Recently'}</span>
                                              </div>
                                              {post.authorName && (
                                                <div className="flex items-center space-x-1">
                                                  <User className="w-4 h-4" />
                                                  <span>{post.authorName}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                            {post.title}
                                          </h2>
                                          
                                          <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                            {post.excerpt || post.content.substring(0, 150) + '...'}
                                          </p>
                                          
                                          {post.tags && (
                                            <div className="flex flex-wrap gap-3 mb-6">
                                              {post.tags.split(',').slice(0, 3).map(tag => (
                                                <span 
                                                  key={tag} 
                                                  className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-xs sm:text-sm font-medium border border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                                                >
                                                  #{tag.trim()}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                        <div className="flex items-center space-x-3">
                                          {currentUser && (post.authorId === currentUser.uid || isAdmin) && (
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditPost(post)}
                                                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                              >
                                                <Edit className="w-4 h-4 mr-2" />
                                                {isAdmin && post.authorId !== currentUser.uid ? 'Admin Edit' : 'Edit'}
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeletePost(post)}
                                                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                              >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {isAdmin && post.authorId !== currentUser.uid ? 'Admin Delete' : 'Delete'}
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            // Allow everyone to read all posts
                                            handleViewPost(post);
                                          }}
                                          disabled={false}
                                          className="group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all"
                                        >
                                          Read Article
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
                          <div className="lg:w-1/3 space-y-8">
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden relative">
                              {/* Gradient background */}
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"></div>
                              <div className="relative">
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
                                  className="w-full py-3 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                  onClick={handleNewPost}
                                >
                                  <Pen className="w-5 h-5 mr-2" />
                                  New Post
                                </Button>
                              </CardContent>
                              </div>
                            </Card>

                            {publishedPosts.length > 0 && (
                              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden relative">
                                {/* Gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50"></div>
                                <div className="relative">
                                  <CardHeader className="pb-4">
                                    <CardTitle className="text-xl flex items-center space-x-2">
                                      <BookOpen className="w-5 h-5 text-purple-600" />
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
                                            className="rounded-full hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300"
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
                                </div>
                              </Card>
                            )}

                            {/* Stats Card */}
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden relative">
                              {/* Gradient background */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
                              <div className="relative">
                                <CardHeader className="pb-4">
                                  <CardTitle className="text-xl flex items-center space-x-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    <span>Blog Stats</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                      <span className="text-gray-700 font-medium">Total Posts</span>
                                      <span className="font-bold text-blue-600 text-lg">{posts.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                      <span className="text-gray-700 font-medium">Published</span>
                                      <span className="font-bold text-green-600 text-lg">{posts.filter(p => p.status === 'published').length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                                      <span className="text-gray-700 font-medium">Drafts</span>
                                      <span className="font-bold text-yellow-600 text-lg">{posts.filter(p => p.status === 'draft').length}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </div>
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
                    <a href="https://www.instagram.com/brop1_2/" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href="https://www.linkedin.com/in/priyansh-tyagi-3972442b0" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="https://github.com/BroPriyansh" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
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
