import request from "supertest";
import app from "../app";

describe("Tasks API", () => {
  let accessToken: string;

  beforeAll(async () => {
    const email = "taskuser@example.com";
    const password = "pass1234";
    await request(app)
      .post("/api/auth/register")
      .send({ name: "TaskUser", email, password });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    accessToken = login.body.accessToken;
  });

  it("creates, lists, updates and deletes a task", async () => {
    const auth = `Bearer ${accessToken}`;

    const create = await request(app)
      .post("/api/tasks")
      .set("Authorization", auth)
      .send({ title: "My Task", description: "desc" })
      .expect(200);

    expect(create.body._id).toBeDefined();
    expect(create.body.title).toBe("My Task");

    const list = await request(app)
      .get("/api/tasks")
      .set("Authorization", auth)
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(1);

    const id = create.body._id;

    const updated = await request(app)
      .put(`/api/tasks/${id}`)
      .set("Authorization", auth)
      .send({ completed: true })
      .expect(200);

    expect(updated.body.completed).toBe(true);

    await request(app)
      .delete(`/api/tasks/${id}`)
      .set("Authorization", auth)
      .expect(200);

    const list2 = await request(app)
      .get("/api/tasks")
      .set("Authorization", auth)
      .expect(200);
    expect(list2.body.length).toBe(0);
  });
});
