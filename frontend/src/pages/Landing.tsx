import { Link } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { Button } from '../components/ui';

export default function Landing() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">Student Community Platform</span>
                            </div>

                            <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl leading-tight text-foreground">
                                Your Campus,
                                <span className="block text-primary mt-2">Connected.</span>
                            </h1>

                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                                Join the ultimate collaborative platform for students. Share knowledge, connect with peers,
                                and unlock your academic potential with ClassConnect.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/forum">
                                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                                        <MessageSquare className="w-5 h-5" />
                                        Explore Forum
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="lg" variant="secondary" className="gap-2">
                                        Get Started Free
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative animate-in fade-in slide-in-from-right duration-700">
                            <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 border border-primary/20">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                                        <Users className="w-8 h-8 text-primary mb-3" />
                                        <h3 className="font-bold text-2xl text-foreground">5K+</h3>
                                        <p className="text-sm text-muted-foreground">Active Students</p>
                                    </div>
                                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                                        <BookOpen className="w-8 h-8 text-primary mb-3" />
                                        <h3 className="font-bold text-2xl text-foreground">12K+</h3>
                                        <p className="text-sm text-muted-foreground">Resources Shared</p>
                                    </div>
                                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                                        <MessageSquare className="w-8 h-8 text-primary mb-3" />
                                        <h3 className="font-bold text-2xl text-foreground">30K+</h3>
                                        <p className="text-sm text-muted-foreground">Discussions</p>
                                    </div>
                                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                                        <TrendingUp className="w-8 h-8 text-primary mb-3" />
                                        <h3 className="font-bold text-2xl text-foreground">95%</h3>
                                        <p className="text-sm text-muted-foreground">Success Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-in fade-in zoom-in-95 duration-500">
                        <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Powerful features designed to enhance your learning experience
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: MessageSquare,
                                title: 'Discussion Forums',
                                description: 'Engage in meaningful conversations with peers about coursework, projects, and academic topics.'
                            },
                            {
                                icon: Users,
                                title: 'Study Groups',
                                description: 'Form study groups, collaborate on assignments, and learn together with classmates.'
                            },
                            {
                                icon: BookOpen,
                                title: 'Resource Sharing',
                                description: 'Share and access study materials, notes, and educational resources from the community.'
                            },
                            {
                                icon: Award,
                                title: 'Peer Recognition',
                                description: 'Give and receive recognition for helpful contributions and quality content.'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Track Progress',
                                description: 'Monitor your engagement and see how you\'re contributing to the community.'
                            },
                            {
                                icon: GraduationCap,
                                title: 'Academic Focus',
                                description: 'Stay focused on what matters - learning, growing, and achieving academic excellence.'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-in fade-in zoom-in-95"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-12 border border-primary/20">
                        <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join thousands of students already learning and growing together on ClassConnect
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/register">
                                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                                    <GraduationCap className="w-5 h-5" />
                                    Create Free Account
                                </Button>
                            </Link>
                            <Link to="/forum">
                                <Button size="lg" variant="secondary" className="gap-2">
                                    Browse Forum
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
