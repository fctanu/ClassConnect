import React from 'react';
import { Heart, User } from 'lucide-react';

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

interface GridCardProps {
  post: Post;
  onLike: (id: string) => void;
}

export default function GridCard({ post, onLike }: GridCardProps) {
  const images = post.images || [];
  const hasImage = images.length > 0;

  return (
    <div
      className="card-hover flex flex-col h-72 overflow-hidden cursor-pointer group"
    >
      <div className="flex-shrink-0 h-40 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {hasImage ? (
          <img
            src={images[0]}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-3 min-h-0">
        <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">
          {post.title}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {post.authorName || 'Anonymous'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(post._id);
            }}
            className={`flex items-center gap-1 text-xs transition-colors ${
              post.likedByMe
                ? 'text-red-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-red-500' : ''}`} />
            <span>{post.likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
