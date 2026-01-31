import React from 'react';
import { Heart, User } from 'lucide-react';
import { Button } from './ui';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/post/${post._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="card shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 p-6 space-y-6 bg-card border-border/60 flex flex-col h-full cursor-pointer group/card animate-in fade-in zoom-in-95"
    >
      {/* Header */}
      <div className="flex items-center gap-4 text-sm" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-heading font-semibold text-foreground text-lg truncate leading-tight">
            {post.authorName || 'Anonymous'}
          </span>
          {(createdLabel || updatedLabel) && (
            <span className="text-xs text-muted-foreground font-medium">
              {createdLabel}
              {updatedLabel && <span className="ml-2 opacity-70">Edited</span>}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="block space-y-3 flex-1">
        <h3 className="text-xl font-heading font-bold text-foreground tracking-tight leading-snug transition-colors">
          {post.title}
        </h3>
        {post.description && (
          <p className="text-base text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-3 lg:line-clamp-4">
            {post.description}
          </p>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} rounded-2xl overflow-hidden mt-4`}>
            {images.slice(0, 4).map((url, index) => (
              <div
                key={`${post._id}-${index}`}
                className={`relative overflow-hidden bg-muted group ${images.length === 1 ? 'aspect-video' : 'aspect-[4/3]'
                  }`}
              >
                <img
                  src={url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white/90 font-bold text-xl backdrop-blur-sm">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-border/40 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(post._id);
          }}
          className={`group flex items-center gap-3 pr-6 pl-2 py-2 rounded-full transition-all duration-300 border w-fit ${post.likedByMe
            ? 'bg-rose-50/50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-500'
            : 'bg-transparent border-transparent hover:bg-secondary hover:border-border text-muted-foreground hover:text-foreground'
            }`}
          title="Like this post"
        >
          <div className={`p-3 rounded-full transition-all duration-300 ${post.likedByMe
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-500 shadow-sm'
            : 'bg-secondary text-muted-foreground group-hover:bg-white dark:group-hover:bg-gray-800 shadow-sm'
            }`}>
            <Heart
              className={`w-5 h-5 transition-transform duration-500 ${post.likedByMe ? 'fill-current animate-like' : 'stroke-[2.5px]'
                } ${!post.likedByMe && 'group-hover:scale-110'}`}
            />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className={`text-base font-bold ${post.likedByMe ? 'text-rose-700 dark:text-rose-400' : 'text-foreground'}`}>
              {post.likeCount}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">Likes</span>
          </div>
        </button>
      </div>
    </div>
  );
}
