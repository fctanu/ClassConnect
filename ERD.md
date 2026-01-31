# MERN Blog ERD

```mermaid
erDiagram
  USERS ||--o{ POSTS : owns
  USERS ||--o{ POST_LIKES : likes
  POSTS ||--o{ POST_LIKES : receives

  USERS {
    ObjectId _id PK
    string name
    string email UNIQUE
    string password
    string[] refreshTokens
    datetime createdAt
    datetime updatedAt
  }

  POSTS {
    ObjectId _id PK
    ObjectId owner FK
    string authorName
    string title
    string description
    string[] images
    number likeCount
    datetime createdAt
    datetime updatedAt
  }

  POST_LIKES {
    ObjectId _id PK
    ObjectId post FK
    ObjectId user FK
    datetime createdAt
  }
```

## Indexes & Best Practices

- `USERS.email` is unique + lowercase + trimmed.
- `POSTS` indexes:
  - `{ createdAt: -1 }` for feed ordering
  - `{ owner: 1, createdAt: -1 }` for user feeds
  - `{ likeCount: -1, createdAt: -1 }` for trending
  - text index on `{ title, description }` for search
- `POST_LIKES` unique compound index on `{ post, user }` to prevent duplicate likes.
- `POSTS.likeCount` is the authoritative counter; `POST_LIKES` stores individual likes.

## Notes

- Images are stored as URLs (including `/uploads/...` for local files).
- Likes are normalized into a separate collection to avoid unbounded arrays on posts.
