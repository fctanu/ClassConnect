import request from "supertest";
import app from "../app";

describe("Posts API", () => {
  let accessToken: string;

  beforeAll(async () => {
    const email = "postuser@example.com";
    const password = "pass1234";
    await request(app)
      .post("/api/auth/register")
      .send({ name: "PostUser", email, password });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    accessToken = login.body.accessToken;
  });

  it("creates, lists, likes, and deletes a post", async () => {
    const auth = `Bearer ${accessToken}`;

    const create = await request(app)
      .post("/api/posts")
      .set("Authorization", auth)
      .send({
        title: "My First Post",
        description: "Hello world",
        images: ["https://example.com/cover.jpg"],
      })
      .expect(201);

    expect(create.body._id).toBeDefined();
    expect(create.body.title).toBe("My First Post");

    const list = await request(app)
      .get("/api/posts")
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(1);

    const id = create.body._id;

    const like = await request(app)
      .post(`/api/posts/${id}/like`)
      .set("Authorization", auth)
      .expect(200);
    expect(like.body.likeCount).toBe(1);
    expect(like.body.likedByMe).toBe(true);

    const unlike = await request(app)
      .post(`/api/posts/${id}/like`)
      .set("Authorization", auth)
      .expect(200);
    expect(unlike.body.likeCount).toBe(0);
    expect(unlike.body.likedByMe).toBe(false);

    await request(app)
      .delete(`/api/posts/${id}`)
      .set("Authorization", auth)
      .expect(200);

    const list2 = await request(app)
      .get("/api/posts")
      .expect(200);
    expect(list2.body.length).toBe(0);
  });
});
