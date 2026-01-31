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
      <div className="animate-in space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
        </div>

        <div className="space-y-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 mb-12">
        <div className="flex flex-col gap-1 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Community Feed</h1>
            <p className="text-muted-foreground text-lg">
              Share updates, photos, and liquid ideas.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
            <PenSquare className="w-4 h-4" />
            {authenticated ? 'Ready to post' : 'Read-only mode'}
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 text-destructive font-medium">
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {authenticated ? (
          <PostForm onCreate={handleCreate} />
        ) : (
          <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="py-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <PenSquare className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading font-bold text-foreground text-2xl tracking-tight">Your Campus, Connected. 🚀</h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                Dive into the ultimate collaborative space for students. Share insights, study together, and unlock your potential with ClassConnect.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <PostList posts={posts} onLike={handleLike} />
    </div>
  );
}
