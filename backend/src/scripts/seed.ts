import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Post from '../models/Post';
import PostLike from '../models/PostLike';
import Comment from '../models/Comment';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:admin123@cluster0.jrcn9ht.mongodb.net/mern_todo?retryWrites=true&w=majority';

const USERS = [
    { name: 'Admin User', email: 'admin@classconnect.com', password: 'AdminPass123!', isAdmin: true },
    { name: 'John Doe', email: 'john@example.com', password: 'UserPass123!' },
    { name: 'Jane Smith', email: 'jane@example.com', password: 'UserPass123!' },
    { name: 'Alice Johnson', email: 'alice@example.com', password: 'UserPass123!' },
    { name: 'Bob Wilson', email: 'bob@example.com', password: 'UserPass123!' },
    { name: 'Security Tester', email: 'hacker@example.com', password: 'UserPass123!' },
];

const POSTS = [
    {
        title: 'Welcome to ClassConnect!',
        description: 'We are excited to launch our new platform. Connect, share, and learn!',
        authorIndex: 0,
    },
    {
        title: 'Tips for MERN Stack Development',
        description: '1. Understand React Hooks\n2. Master Express Middleware\n3. Learn MongoDB Aggregation',
        authorIndex: 1,
    },
    {
        title: 'XSS Attempt (Should be Sanitized)',
        description: 'This is a test: <script>alert("XSS")</script>. If you see an alert, it failed.',
        authorIndex: 5,
    },
    {
        title: 'Final Year Project Ideas',
        description: 'Here are some great ideas: AI Chatbot, E-commerce, Task Manager, Social Media Dashboard.',
        authorIndex: 2,
    },
    {
        title: 'Looking for Study Group',
        description: 'Anyone studying for the upcoming Algorithms exam? Let\'s meet up in the library.',
        authorIndex: 3,
    },
    {
        title: 'Best VS Code Extensions',
        description: 'Prettier, ESLint, GitLens, and Tailwind CSS IntelliSense are must-haves!',
        authorIndex: 4,
    },
    {
        title: 'NoSQL Injection Test',
        description: 'Testing if {"$gt": ""} works in queries. It should be sanitized.',
        authorIndex: 5,
    },
    {
        title: 'Internship Opportunities',
        description: 'Check out the career center for new summer internship listings.',
        authorIndex: 0,
    },
    {
        title: 'React 19 Features',
        description: 'The new compiler looks amazing. Automatic memoization will save so much time.',
        authorIndex: 1,
    },
    {
        title: 'Campus Photography Club',
        description: 'Meeting this Friday at 5 PM. Bring your cameras!',
        authorIndex: 2,
    },
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        // Clear existing data
        console.log('Clearing old data...');
        await User.deleteMany({});
        await Post.deleteMany({});
        await PostLike.deleteMany({});
        await Comment.deleteMany({});

        // Create Users
        console.log('Creating users...');
        const userDocs = [];
        for (const u of USERS) {
            const hashed = await bcrypt.hash(u.password, 10);
            const user = await User.create({
                name: u.name,
                email: u.email,
                password: hashed,
            });
            userDocs.push(user);
            console.log(` Created user: ${u.email}`);
        }

        // Create Posts
        console.log('Creating posts...');
        const postDocs = [];
        for (const p of POSTS) {
            const author = userDocs[p.authorIndex];
            const post = await Post.create({
                title: p.title,
                description: p.description,
                owner: author._id,
                authorName: author.name,
                images: [`https://picsum.photos/seed/${Math.random()}/800/400`], // Random placeholder image
                likeCount: 0,
            });
            postDocs.push(post);
        }
        console.log(` Created ${postDocs.length} posts`);

        // Create Likes (Random)
        console.log('Creating likes...');
        for (const post of postDocs) {
            // Random number of likes (0 to 5)
            const likeCount = Math.floor(Math.random() * 5);
            const likers = userDocs.sort(() => 0.5 - Math.random()).slice(0, likeCount);

            for (const liker of likers) {
                await PostLike.create({ post: post._id, user: liker._id });
            }

            post.likeCount = likeCount;
            await post.save();
        }

        // Create Comments
        console.log('Creating comments...');
        for (const post of postDocs) {
            const commentCount = Math.floor(Math.random() * 3);
            const commenters = userDocs.sort(() => 0.5 - Math.random()).slice(0, commentCount);

            for (const commenter of commenters) {
                await Comment.create({
                    post: post._id,
                    user: commenter._id,
                    userName: commenter.name,
                    content: `This is a test comment by ${commenter.name}. Looks great!`,
                });
            }
        }

        console.log('✅ Seeding complete!');
        console.log('\n--- CREDENTIALS ---');
        console.log(`Admin: ${USERS[0].email} / ${USERS[0].password}`);
        console.log(`User:  ${USERS[1].email} / ${USERS[1].password}`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
