const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function collectionExists(name) {
  const collections = await mongoose.connection.db.listCollections({ name }).toArray();
  return collections.length > 0;
}

async function dropIfExists(name) {
  if (await collectionExists(name)) {
    await mongoose.connection.db.dropCollection(name);
    console.log(`Dropped collection: ${name}`);
  }
}

async function migrateLikes() {
  const db = mongoose.connection.db;
  const postsCollection = db.collection('posts');
  const postLikesCollection = db.collection('postlikes');
  await postLikesCollection.createIndex({ post: 1, user: 1 }, { unique: true });

  const posts = await postsCollection.find({ likes: { $exists: true } }).toArray();
  if (posts.length === 0) return;

  console.log(`Found ${posts.length} posts with legacy likes arrays`);
  for (const post of posts) {
    const likes = Array.isArray(post.likes) ? post.likes : [];
    const uniqueUsers = new Set(likes.map((id) => id.toString()));
    for (const userId of likes) {
      try {
        await postLikesCollection.updateOne(
          { post: post._id, user: userId },
          { $setOnInsert: { post: post._id, user: userId, createdAt: new Date() } },
          { upsert: true },
        );
      } catch (err) {
        // ignore duplicates
      }
    }
    await postsCollection.updateOne(
      { _id: post._id },
      { $set: { likeCount: uniqueUsers.size }, $unset: { likes: '' } },
    );
  }
  console.log('Migrated likes to PostLike and removed likes array from posts.');
}

async function cleanup() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await dropIfExists('tasks');
  await dropIfExists('projects');

  await migrateLikes();

  await mongoose.disconnect();
  console.log('Cleanup complete');
}

cleanup().catch((err) => {
  console.error(err);
  process.exit(1);
});
