import "jsr:@std/dotenv/load";
import { Hono } from "hono";
import { candidateRoute } from "./routes/candidate/index.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.route("/candidate", candidateRoute);

Deno.serve(app.fetch);
