import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Calendar, Clock, User, Tag, BookOpen, Share2, Heart, MessageCircle } from 'lucide-react';

export default function ArticleView({ post, allPosts, onBack, onViewPost }) {
  const [readingTime, setReadingTime] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'John Doe',
      content: 'Great article! Very informative and well-written.',
      date: new Date(Date.now() - 86400000).toISOString(),
      avatar: 'JD'
    },
    {
      id: 2,
      author: 'Sarah Wilson',
      content: 'This helped me understand the concepts better. Thanks for sharing!',
      date: new Date(Date.now() - 172800000).toISOString(),
      avatar: 'SW'
    }
  ]);

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

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        author: 'You',
        content: comment.trim(),
        date: new Date().toISOString(),
        avatar: 'YO'
      };
      setComments(prev => [newComment, ...prev]);
      setComment('');
      setShowCommentForm(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Blog</span>
            </Button>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600 transition-colors" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className={`transition-colors ${isLiked ? 'text-red-600 bg-red-50' : 'hover:bg-red-50 hover:text-red-600'}`} onClick={handleLike}>
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'} ({likeCount})
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-indigo-600 mb-4">
              {post.tags?.split(',')[0]?.trim() && (
                <>
                  <Tag className="w-4 h-4" />
                  <span>{post.tags.split(',')[0].trim()}</span>
                </>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">{post.authorName || 'WriteMind Team'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">{new Date(post.updatedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">{readingTime} min read</span>
              </div>
            </div>

            {/* Featured Image Placeholder */}
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl mb-8 flex items-center justify-center border border-indigo-100 shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-indigo-700 font-medium text-lg">Article Featured Image</p>
                <p className="text-indigo-500 text-sm mt-1">Upload your image here</p>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 mb-12">
            <div className="max-w-none">
              <div className="text-gray-700 leading-relaxed text-lg space-y-6">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 text-gray-700 leading-8 text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`transition-colors ${isLiked ? 'bg-red-50 text-red-600 border-red-200' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                    onClick={handleLike}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Liked' : 'Like'} ({likeCount})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                    onClick={() => setShowCommentForm(!showCommentForm)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comment ({comments.length})
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Comments ({comments.length})</h3>
            
            {/* Comment Form */}
            {showCommentForm && (
              <Card className="mb-6 border-2 border-blue-100 bg-blue-50/30">
                <CardContent className="p-6">
                  <form onSubmit={handleComment} className="space-y-4">
                    <div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCommentForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!comment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map(comment => (
                <Card key={comment.id} className="border border-gray-100">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tags */}
          {post.tags && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-3">
                {post.tags.split(',').map(tag => (
                  <span 
                    key={tag} 
                    className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 hover:from-indigo-200 hover:to-blue-200 transition-all duration-200 cursor-pointer"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Card 
                    key={relatedPost.id} 
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-200 group"
                    onClick={() => onViewPost && onViewPost(relatedPost)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2 text-sm text-indigo-600 mb-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-3 h-3" />
                        </div>
                        <span className="font-medium">{relatedPost.tags?.split(',')[0]?.trim()}</span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors">{relatedPost.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {relatedPost.excerpt || relatedPost.content.substring(0, 120) + '...'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(relatedPost.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
                <p className="text-indigo-100 mb-8 text-lg leading-relaxed">
                  Get the latest articles and insights delivered to your inbox. Join thousands of readers who trust us for quality content.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 border-0 shadow-sm focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200"
                  />
                  <Button className="px-8 py-4 bg-white text-indigo-600 hover:bg-gray-50 rounded-xl font-semibold shadow-sm transition-all duration-200">
                    Subscribe
                  </Button>
                </div>
                <p className="text-indigo-200 text-sm mt-4">
                  No spam, unsubscribe at any time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 