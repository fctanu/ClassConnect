import React from 'react';
import PostCard from './PostCard';
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
        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
          <ImageOff className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-heading font-medium text-foreground mb-2">No posts yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Be the first to share something with the community.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onLike={onLike} />
      ))}
    </div>
  );
}
