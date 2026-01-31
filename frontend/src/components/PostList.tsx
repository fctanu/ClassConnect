import React from 'react';
import GridCard from './GridCard';
import { ImageOff } from 'lucide-react';

type Post = {
  _id: string;
  title: string;
  description?: string;
  images?: string[];
  likeCount: number;
  likedByMe?: boolean;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
};

interface PostListProps {
  posts: Post[];
  onLike: (id: string) => void;
}

export default function PostList({ posts, onLike }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 animate-in">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageOff className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Be the first to share something with the community.
        </p>
      </div>
    );
  }

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <GridCard key={post._id} post={post} onLike={onLike} />
      ))}
    </div>
  );
}
