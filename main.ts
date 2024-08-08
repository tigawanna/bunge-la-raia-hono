import "jsr:@std/dotenv/load";
import { Hono } from "hono";
import { candidateRoute } from "./routes/candidate/index.ts";
import { userRoute } from "./routes/user/index.ts";
import { candidateAspirationRoute } from "./routes/aspiration/index.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.route("/user", userRoute);
app.route("/candidate", candidateRoute);
app.route("/aspiration", candidateAspirationRoute);

Deno.serve(app.fetch);
