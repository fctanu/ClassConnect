import request from "supertest";
import app from "../app";

describe("Auth endpoints", () => {
  it("registers and logs in a user", async () => {
    const email = "test@example.com";
    const password = "password123";

    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Tester", email, password })
      .expect(200);

    expect(reg.body.userId).toBeDefined();

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    expect(login.body.accessToken).toBeDefined();
    expect(login.headers["set-cookie"]).toBeDefined();
  });
});
