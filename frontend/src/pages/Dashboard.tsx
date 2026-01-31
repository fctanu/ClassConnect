import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Card, CardContent } from '../components/ui';
import { SkeletonCard, Skeleton } from '../components/ui/Skeleton';
import { getPosts, createPost, toggleLike } from '../services/api';
import axios from 'axios';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import { PenSquare } from 'lucide-react';
import { toast } from 'sonner';

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

export default function Dashboard() {
  const { authenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await getPosts();
      setPosts(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load posts', err);
      setError('Could not load posts. Please try again.');
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(
    payload: FormData | { title: string; description?: string; images?: string[] }
  ) {
    try {
      const res = await createPost(payload);
      setPosts((prev) => [res.data, ...prev]);
      toast.success('Post published');
    } catch (err) {
      console.error('Create failed', err);
      let message = 'Failed to publish post';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; errors?: Array<{ msg?: string }> } | undefined;
        message = data?.errors?.[0]?.msg || data?.message || message;
      }
      toast.error(message);
    }
  }

  async function handleLike(postId: string) {
    if (!authenticated) {
      toast.info('Please log in to like posts');
      return;
    }
    try {
      const res = await toggleLike(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, likeCount: res.data.likeCount, likedByMe: res.data.likedByMe }
            : post,
        ),
      );
    } catch (err) {
      console.error('Like failed', err);
      toast.error('Failed to update like');
    }
  }

  if (loading) {
    return (
      <div className="animate-in space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Community Feed</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Share updates, photos, and short stories with everyone.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <PenSquare className="w-4 h-4" />
          {authenticated ? 'You can post to the feed' : 'Log in to publish your own posts'}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {authenticated ? (
        <PostForm onCreate={handleCreate} />
      ) : (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="py-4 text-sm text-gray-600 dark:text-gray-400">
            Sign in to share your own posts and like others.
          </CardContent>
        </Card>
      )}

      <PostList posts={posts} onLike={handleLike} />
    </div>
  );
}
