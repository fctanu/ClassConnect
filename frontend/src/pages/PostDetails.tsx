import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, toggleLike, getComments, createComment } from '../services/api';
import { Button, Card, CardContent } from '../components/ui';
import { ArrowLeft, User, Heart, Calendar, Share2, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthProvider';
import { Skeleton } from '../components/ui/Skeleton';

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

type Comment = {
    _id: string;
    content: string;
    authorName: string;
    createdAt: string;
};

const formatJakarta = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(date);
};

export default function PostDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { authenticated } = useAuth();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentInput, setCommentInput] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (!id) return;
        loadPost(id);
        loadComments(id);
    }, [id]);

    async function loadPost(postId: string) {
        try {
            setLoading(true);
            const res = await getPost(postId);
            setPost(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load post.");
        } finally {
            setLoading(false);
        }
    }

    async function loadComments(postId: string) {
        try {
            const res = await getComments(postId);
            setComments(res.data);
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    }

    async function handleLike() {
        if (!authenticated) {
            toast.info('Please log in to like posts');
            return;
        }
        if (!post) return;

        try {
            const res = await toggleLike(post._id);
            setPost(prev => prev ? ({ ...prev, likeCount: res.data.likeCount, likedByMe: res.data.likedByMe }) : null);
        } catch (err) {
            toast.error('Failed to like post');
        }
    }

    async function handleSubmitComment(e: React.FormEvent) {
        e.preventDefault();
        if (!authenticated) {
            toast.info('Please log in to comment');
            return;
        }
        if (!post || !commentInput.trim()) return;

        try {
            setSubmittingComment(true);
            const res = await createComment(post._id, commentInput.trim());
            setComments(prev => [res.data, ...prev]);
            setCommentInput('');
            toast.success('Comment added!');
        } catch (err) {
            toast.error('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 animate-in">
                <div className="mb-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                </div>
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <Skeleton className="w-full aspect-video rounded-2xl mb-8" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in">
                <h2 className="text-2xl font-bold font-heading mb-2">Post not found</h2>
                <p className="text-muted-foreground mb-6">The post you are looking for does not exist or has been removed.</p>
                <Link to="/">
                    <Button variant="secondary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Feed
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-in">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4 sm:mb-8 group text-sm sm:text-base">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Feed
            </Link>

            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-10 border border-border">
                <article className="space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 bg-secondary/50 px-2 sm:px-3 py-1 rounded-full">
                                <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                {formatJakarta(post.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                {post.authorName || 'Anonymous'}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold font-heading text-foreground leading-tight tracking-tight">
                            {post.title}
                        </h1>
                    </div>

                    {/* Hero Image */}
                    {post.images && post.images.length > 0 && (
                        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/20">
                            <img
                                src={post.images[0]}
                                alt={post.title}
                                className="w-full object-cover max-h-[600px]"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                        {post.description ? (
                            <p className="whitespace-pre-wrap text-lg">{post.description}</p>
                        ) : (
                            <p className="italic text-muted-foreground/50">No description provided.</p>
                        )}
                    </div>

                    <hr className="border-border" />

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-4">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Button
                                onClick={handleLike}
                                variant={post.likedByMe ? 'danger' : 'secondary'}
                                size="sm"
                                className={`gap-2 sm:gap-3 rounded-full transition-all duration-300 flex-1 sm:flex-none justify-center ${post.likedByMe ? 'shadow-lg shadow-red-500/25' : ''}`}
                            >
                                <Heart className={`w-4 sm:w-6 h-4 sm:h-6 ${post.likedByMe ? 'fill-current animate-like' : ''}`} />
                                <span className="font-semibold text-sm sm:text-base">{post.likeCount}</span>
                            </Button>

                            <Button variant="ghost" size="sm" className="gap-2 rounded-full text-muted-foreground flex-1 sm:flex-none justify-center">
                                <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                                <span className="hidden sm:inline">Comment</span>
                            </Button>

                            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground flex-1 sm:flex-none justify-center">
                                <Share2 className="w-4 sm:w-5 h-4 sm:h-5" />
                                <span className="hidden sm:inline ml-2">Share</span>
                            </Button>
                        </div>
                    </div>
                </article>
            </div>

            {/* Gallery if more images */}
            {post.images && post.images.length > 1 && (
                <div className="mt-12 space-y-6">
                    <h3 className="text-2xl font-bold font-heading">Gallery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {post.images.slice(1).map((img, idx) => (
                            <div key={idx} className="rounded-xl overflow-hidden shadow-md">
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comments Section */}
            <div className="mt-12 space-y-6">
                <h3 className="text-2xl font-bold font-heading flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    Comments ({comments.length})
                </h3>

                {/* Comment Input */}
                {authenticated ? (
                    <form onSubmit={handleSubmitComment} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        <textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full px-4 py-3 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            rows={3}
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                                {commentInput.length}/500
                            </span>
                            <Button
                                type="submit"
                                disabled={!commentInput.trim() || submittingComment}
                                className="gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {submittingComment ? 'Posting...' : 'Post Comment'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-secondary/30 rounded-xl border border-border p-6 text-center">
                        <p className="text-muted-foreground">
                            Please <Link to="/login" className="text-primary font-semibold hover:underline">log in</Link> to leave a comment
                        </p>
                    </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment._id} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-foreground">{comment.authorName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatJakarta(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
