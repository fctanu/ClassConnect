import React from 'react';
import { Heart, ImageOff, User } from 'lucide-react';
import { Button } from './ui';

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

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
}

const formatJakarta = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return date.toLocaleString('en-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toLocaleString();
  }
};

export default function PostCard({ post, onLike }: PostCardProps) {
  const images = post.images || [];
  const createdLabel = formatJakarta(post.createdAt);
  const updatedLabel =
    post.updatedAt && post.updatedAt !== post.createdAt ? formatJakarta(post.updatedAt) : '';

  return (
    <div className="card-hover p-4 space-y-4">
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {post.authorName || 'Anonymous'}
          </span>
          {(createdLabel || updatedLabel) && (
            <span className="text-xs truncate">
              {createdLabel}
              {updatedLabel && <span className="ml-2">Edited {updatedLabel}</span>}
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{post.title}</h3>
        {post.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {post.description}
          </p>
        )}
      </div>

      {images.length > 0 ? (
        <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
          {images.slice(0, 3).map((url, index) => (
            <div
              key={`${post._id}-${index}`}
              className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <img
                src={url}
                alt={`Post image ${index + 1}`}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
              {index === 2 && images.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                  +{images.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <ImageOff className="w-4 h-4" />
          No images attached
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 transition-colors ${
            post.likedByMe ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-red-500' : ''}`} />
          <span className="text-sm">{post.likeCount}</span>
        </Button>
      </div>
    </div>
  );
}
