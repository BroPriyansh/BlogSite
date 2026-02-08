import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Calendar, Clock, User, Tag, BookOpen, Share2, Heart, MessageCircle, Trash2, Coffee } from 'lucide-react';
import { likePost, getLikeCount, checkUserLike, addComment, getComments, deleteComment } from '../services/postsService';
import { getUserProfile } from '../services/userService';
import PaymentModal from './PaymentModal';
import { formatDateOnly, formatDateTime } from '../utils/dateUtils';

export default function ArticleView({ post, allPosts, onBack, onViewPost, currentUser }) {
  const [readingTime, setReadingTime] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load author profile
  useEffect(() => {
    const loadAuthorProfile = async () => {
      if (post?.authorId) {
        try {
          const profile = await getUserProfile(post.authorId);
          setAuthorProfile(profile);
        } catch (error) {
          console.error('Error loading author profile:', error);
        }
      }
    };
    loadAuthorProfile();
  }, [post?.authorId]);

  // Debug: Log post data
  useEffect(() => {
    console.log('ArticleView - Post data:', {
      id: post?.id,
      title: post?.title,
      imageUrl: post?.imageUrl ? post.imageUrl.substring(0, 100) + '...' : 'No image',
      hasImageUrl: !!post?.imageUrl,
      imageUrlLength: post?.imageUrl?.length || 0
    });
  }, [post]);

  // Calculate reading time
  useEffect(() => {
    if (post?.content) {
      const wordsPerMinute = 200;
      const wordCount = post.content.split(' ').length;
      const time = Math.ceil(wordCount / wordsPerMinute);
      setReadingTime(time);
    }
  }, [post]);

  // Find related posts based on tags
  useEffect(() => {
    if (post && allPosts) {
      const postTags = post.tags?.split(',').map(tag => tag.trim().toLowerCase()) || [];
      const related = allPosts
        .filter(p => p.id !== post.id && p.status === 'published')
        .filter(p => {
          const pTags = p.tags?.split(',').map(tag => tag.trim().toLowerCase()) || [];
          return pTags.some(tag => postTags.includes(tag));
        })
        .slice(0, 3);
      setRelatedPosts(related);
    }
  }, [post, allPosts]);

  // Load like count and user like status
  useEffect(() => {
    const loadLikeData = async () => {
      if (post?.id) {
        try {
          console.log('Loading like data for post:', post.id);
          console.log('Current user:', currentUser);

          const [count, userLiked] = await Promise.all([
            getLikeCount(post.id),
            currentUser ? checkUserLike(post.id, currentUser.uid) : false
          ]);

          console.log('Like count:', count, 'User liked:', userLiked);
          setLikeCount(count);
          setIsLiked(userLiked);
        } catch (error) {
          console.error('Error loading like data:', error);
        }
      }
    };

    loadLikeData();
  }, [post?.id, currentUser]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (post?.id) {
        try {
          console.log('Loading comments for post:', post.id);
          const commentsData = await getComments(post.id);
          console.log('Comments loaded:', commentsData);
          setComments(commentsData);
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      }
    };

    loadComments();
  }, [post?.id]);

  const handleLike = async () => {
    if (!currentUser) {
      // Show login prompt or redirect to login
      alert('Please log in to like posts. You can sign up or sign in using the login button in the header.');
      return;
    }

    if (!currentUser.uid) {
      console.error('User object missing uid:', currentUser);
      alert('User authentication error. Please try logging in again.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting to like post:', post.id, 'by user:', currentUser.uid);
      const result = await likePost(post.id, currentUser.uid);
      console.log('Like result:', result);
      setIsLiked(result.liked);
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to comment. You can sign up or sign in using the login button in the header.');
      return;
    }

    if (!currentUser.uid) {
      console.error('User object missing uid:', currentUser);
      alert('User authentication error. Please try logging in again.');
      return;
    }

    if (comment.trim()) {
      try {
        setIsLoading(true);
        console.log('Attempting to add comment to post:', post.id, 'by user:', currentUser.uid);
        const newComment = await addComment(
          post.id,
          { content: comment.trim() },
          currentUser.uid,
          currentUser.name || 'Anonymous'
        );
        console.log('Comment added successfully:', newComment);

        // Safely add the comment to the state
        try {
          setComments(prev => [newComment, ...prev]);
          setComment('');
          setShowCommentForm(false);
        } catch (stateError) {
          console.error('Error updating comment state:', stateError);
          // If state update fails, reload comments from server
          const updatedComments = await getComments(post.id);
          setComments(updatedComments);
          setComment('');
          setShowCommentForm(false);
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) {
      alert('Please log in to delete comments.');
      return;
    }

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting to delete comment:', commentId);
      await deleteComment(post.id, commentId);
      console.log('Comment deleted successfully');
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely format timestamp
  const formatTimestamp = (timestamp) => {
    const formatted = formatDateTime(timestamp);
    return formatted || 'Just now';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || post.content.substring(0, 100),
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Article not found</h2>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Error boundary for the component
  if (!post.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Article</h2>
          <p className="text-gray-600 mb-4">The article data is invalid or corrupted.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-gray-100 transition-colors px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back to Blog</span>
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-green-50 hover:text-green-600 transition-colors hidden sm:flex"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`transition-colors ${isLiked ? 'text-red-600 bg-red-50' : 'hover:bg-red-50 hover:text-red-600'}`}
                onClick={handleLike}
                disabled={isLoading}
                title={!currentUser ? 'Please log in to like posts' : ''}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 ${isLiked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
                {likeCount > 0 && <span className="text-xs sm:text-sm">({likeCount})</span>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center space-x-2 text-sm text-indigo-600 mb-4 sm:mb-6">
              {post.tags?.split(',')[0]?.trim() && (
                <>
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{post.tags.split(',')[0].trim()}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 mb-8 sm:mb-10">
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-sm sm:text-base">{post.authorName || 'WriteMind Team'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-sm sm:text-base">
                  {formatDateOnly(post.updatedAt) || 'Recently'}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-sm sm:text-base">{readingTime} min read</span>
              </div>
            </div>

            {/* Featured Image */}
            {post.imageUrl ? (
              <div className="w-full mb-8 sm:mb-10">
                <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg relative">
                  <img
                    src={post.imageUrl}
                    alt="Featured image"
                    className="w-full max-h-[600px] object-contain bg-gray-50"
                    onLoad={() => console.log('Image loaded successfully:', post.imageUrl?.substring(0, 50) + '...')}
                    onError={(e) => {
                      console.error('Image failed to load:', post.imageUrl?.substring(0, 50) + '...');
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.image-fallback');
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="image-fallback w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center border border-indigo-100" style={{ display: 'none' }}>
                    <div className="text-center p-4 sm:p-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                      </div>
                      <p className="text-indigo-700 font-medium text-base sm:text-lg">Image not available</p>
                      <p className="text-indigo-500 text-xs sm:text-sm mt-1">Featured image could not be loaded</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl mb-8 sm:mb-10 flex items-center justify-center border border-indigo-100 shadow-sm">
                <div className="text-center p-4 sm:p-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                  </div>
                  <p className="text-indigo-700 font-medium text-base sm:text-lg">No Featured Image</p>
                  <p className="text-indigo-500 text-xs sm:text-sm mt-1">This article doesn't have a featured image</p>
                </div>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 md:p-12 mb-12 sm:mb-16">
            <div className="max-w-none">
              <div className="text-gray-700 leading-relaxed text-base sm:text-lg lg:text-xl space-y-6">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 text-gray-700 leading-7 sm:leading-8 text-base sm:text-lg lg:text-xl">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`transition-colors px-4 py-2 ${isLiked ? 'bg-red-50 text-red-600 border-red-200' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                    onClick={handleLike}
                    disabled={isLoading}
                    title={!currentUser ? 'Please log in to like posts' : ''}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
                    {likeCount > 0 && <span className="text-xs sm:text-sm">({likeCount})</span>}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors px-4 py-2"
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    disabled={isLoading}
                    title={!currentUser ? 'Please log in to comment' : ''}
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Comment</span>
                    {comments.length > 0 && <span className="text-xs sm:text-sm">({comments.length})</span>}
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  {authorProfile?.upiId && (
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700 transition-colors px-4 py-2"
                      onClick={() => {
                        const isMobile = window.innerWidth < 768;
                        if (isMobile) {
                          window.location.href = `upi://pay?pa=${authorProfile.upiId}&pn=${encodeURIComponent(authorProfile.name || 'Author')}&cu=INR`;
                        } else {
                          setShowPaymentModal(true);
                        }
                      }}
                    >
                      <Coffee className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Support with UPI</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors px-4 py-2"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-16 sm:mb-20">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                  <span>Comments</span>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    {comments.length}
                  </span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  disabled={isLoading}
                  className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-200"
                  title={!currentUser ? 'Please log in to comment' : ''}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {showCommentForm ? 'Cancel' : 'Add Comment'}
                </Button>
              </div>

              {/* Comment Form */}
              {showCommentForm && (
                <div className="mb-8 p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-100">
                  {!currentUser ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">Sign in to Comment</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Join the conversation! Sign in to share your thoughts and engage with our community.
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowCommentForm(false)}
                          className="px-6 py-3"
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            setShowCommentForm(false);
                            // You could add a callback here to open the auth modal
                          }}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700"
                        >
                          Sign In
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleComment} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Share your thoughts...
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What do you think about this article? Share your insights, questions, or experiences..."
                          className="w-full p-4 sm:p-6 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-500"
                          rows={4}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCommentForm(false)}
                          disabled={isLoading}
                          className="px-6 py-3"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={!comment.trim() || isLoading}
                          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Posting...
                            </>
                          ) : (
                            'Post Comment'
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">No comments yet</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Be the first to share your thoughts! Your comment could start an interesting discussion.
                    </p>
                    {currentUser && (
                      <Button
                        onClick={() => setShowCommentForm(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Add First Comment
                      </Button>
                    )}
                  </div>
                ) : (
                  comments.map(comment => {
                    try {
                      return (
                        <div key={comment.id} className="group hover:bg-gray-50 rounded-xl p-4 sm:p-6 transition-all duration-200 border border-gray-100 hover:border-gray-200">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-lg flex-shrink-0">
                              {comment.authorName?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-center space-x-3">
                                  <span className="font-semibold text-gray-900 text-lg">{comment.authorName || 'Anonymous'}</span>
                                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {formatTimestamp(comment.timestamp)}
                                  </span>
                                </div>
                                {/* Show delete button only for comment author or admin */}
                                {(currentUser && (comment.authorId === currentUser.uid || currentUser.email === 'memuforpc12@gmail.com')) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering comment:', error, comment);
                      return (
                        <div key={comment.id} className="group hover:bg-gray-50 rounded-xl p-4 sm:p-6 transition-all duration-200 border border-gray-100 hover:border-gray-200">
                          <div className="text-center text-gray-500">
                            <p className="mb-3">Error displaying comment</p>
                            {(currentUser && (comment.authorId === currentUser.uid || currentUser.email === 'memuforpc12@gmail.com')) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete comment"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && (
            <div className="mb-12 sm:mb-16">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Tags</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {post.tags.split(',').map(tag => (
                  <span
                    key={tag}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full text-xs sm:text-sm font-medium border border-indigo-200 hover:from-indigo-200 hover:to-blue-200 transition-all duration-200 cursor-pointer"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Related Articles</h2>
            {relatedPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {relatedPosts.map(relatedPost => (
                  <Card
                    key={relatedPost.id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-200 group"
                    onClick={() => onViewPost && onViewPost(relatedPost)}
                  >
                    <CardHeader className="pb-3 p-4 sm:p-6">
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-indigo-600 mb-2">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-2 h-2 sm:w-3 sm:h-3" />
                        </div>
                        <span className="font-medium">{relatedPost.tags?.split(',')[0]?.trim()}</span>
                      </div>
                      <CardTitle className="text-base sm:text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors">{relatedPost.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed text-sm sm:text-base">
                        {relatedPost.excerpt || relatedPost.content.substring(0, 120) + '...'}
                      </p>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{formatDateOnly(relatedPost.updatedAt) || 'Recently'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sorry, no recommendation</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find any other articles with similar tags. Check back later for more content!
                </p>
              </div>
            )}
          </div>

          {/* Newsletter Signup */}
          <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Stay Updated</h3>
                <p className="text-indigo-100 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                  Get the latest articles and insights delivered to your inbox. Join thousands of readers who trust us for quality content.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-gray-900 placeholder-gray-500 border-0 shadow-sm focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 text-sm sm:text-base"
                  />
                  <Button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 hover:bg-gray-50 rounded-xl font-semibold shadow-sm transition-all duration-200 text-sm sm:text-base">
                    Subscribe
                  </Button>
                </div>
                <p className="text-indigo-200 text-xs sm:text-sm mt-4">
                  No spam, unsubscribe at any time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main >

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        authorName={authorProfile?.name || 'Author'}
        upiId={authorProfile?.upiId || ''}
      />
    </div >
  );
} 