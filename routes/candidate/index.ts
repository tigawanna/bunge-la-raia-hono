
import { Hono } from "hono";

const app = new Hono();
app.post("/summarize", async (c) => {
  const body = await c.req.json();
});
app.post("/embed", async (c) => {
  const body = await c.req.json();
});
app.post("/chat", async (c) => {
  const body = await c.req.json();
});

export { app as candidate };
