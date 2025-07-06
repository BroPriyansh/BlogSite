import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, Calendar, User, Edit, Eye } from 'lucide-react';

const PostCard = ({ post, onView, onEdit, currentUser }) => {
  const readingTime = Math.ceil(post.content.split(' ').length / 200);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
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
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
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
                onClick={() => onEdit(post)}
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
            onClick={() => post.status === 'published' ? onView(post) : (currentUser && post.authorId === currentUser.uid ? onEdit(post) : null)}
            disabled={post.status !== 'published' && (!currentUser || post.authorId !== currentUser.uid)}
            className="group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all"
          >
            {post.status === 'published' ? 'Read Article' : 'Edit'}
            <BookOpen className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
