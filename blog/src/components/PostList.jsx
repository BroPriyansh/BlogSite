import React from 'react';
import PostCard from './PostCard';

const PostList = ({ posts, onView, onEdit, currentUser }) => {
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onView={onView}
          onEdit={onEdit}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

export default PostList;
