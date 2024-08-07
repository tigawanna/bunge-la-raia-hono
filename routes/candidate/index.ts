import { Hono } from "hono";
import { CandidateRecordType, validateCandidate } from "../../helpers/validate-record.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.44.4";
import { Database } from "../../supabase/db-types.ts";
import { geminiEmbedding } from "../../helpers/generate-embedding.ts";
import { getCandidateContext, updateCandidate } from "./supabase.ts";
import { generateCandidateVibeSummary } from "../../helpers/generate-summary.ts";
import { ipRateLimit, viewerRateLimit } from "./rate-limit.ts";
import { chatWith } from "../../helpers/chat-with.ts";
interface SummarizeRequestBody {
  record: CandidateRecordType;
}
const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "candidate route" });
});
app.get("/summarize", (c) => {
  return c.json({ message: "summary route" });
});

app.post("/summarize", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || authHeader.length < 10) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const supabaseClient = createClient<Database>(Deno.env.get("SUPABASE_URL") ?? "", authHeader, {
      global: { headers: { Authorization: authHeader } },
    });
    const { record } = await c.req.json<SummarizeRequestBody>();
    if (!record) {
      return c.json({ message: "payload should be provided" }, 400);
    }
    if (!record?.id) {
      return c.json({ message: "payload record id should be provided" }, 400);
    }
    const raw_string_input = validateCandidate(record);
    if (raw_string_input instanceof Response) {
      return raw_string_input;
    }

    //  get candidate's most recent spirations
    const candidateContext = await getCandidateContext({ sb: supabaseClient, record });
    const summary_response = await generateCandidateVibeSummary({
      inputText: candidateContext,
    });
    const summary_text = summary_response.response.text();
    // early return if summary generation failed
    if (!summary_text) {
      return c.json({ message: "candidate summary generation failed" }, 400);
    }
    const embeddingResult = await geminiEmbedding({
      inputText: candidateContext,
    });
    // update candidate summary
    const { error: updateCandidateSummaryError } = await updateCandidate({
      sb: supabaseClient,
      record: {
        id: record.id,
        candidate_summary: summary_text,
      },
    });

    if (updateCandidateSummaryError) {
      return c.json(
        { message: "candidate summary update failed" + updateCandidateSummaryError.message },
        400
      );
    }
    // update candidate embedding
    const { error: updateCandidateEmbeddingError } = await updateCandidate({
      sb: supabaseClient,
      //@ts-expect-error: this might be wrong
      record: { id: record.id, embedding: embeddingResult.embedding.values },
    });
    if (updateCandidateEmbeddingError) {
      return c.json(
        { message: "candidate embedding update failed" + updateCandidateEmbeddingError.message },
        400
      );
    }
    return c.json({ message: "candidate  summary + embedding updated successfully" }, 200);
  } catch (error) {
    return c.json({ message: "Something went wrong: " + error.message }, 500);
  }
});

interface ChatRequestBody {
  viewer_id: string;
  prompt: string;
  context_text: string; // this should be info about the candidate's most recent spirations together with any chat history if vailabe
}
app.get("/chat", (c) => {
  return c.json({ message: "chat route" });
});
app.post("/chat", async (c) => {
  const kv = await Deno.openKv();
  await ipRateLimit({ c, kv });
  const { context_text, viewer_id, prompt } = await c.req.json<ChatRequestBody>();
  if (!viewer_id) {
    return c.json({ message: "viewer id should be provided" }, 400);
  }
  if (!context_text) {
    return c.json({ message: "context text should be provided" }, 400);
  }
  const supabaseClient = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_KEY") ?? ""
  );
  await viewerRateLimit({ c, kv, sb: supabaseClient, viewer_id });
  await chatWith({ context_text, prompt });
  return c.json({ message: "chat route" });
});

export { app as candidateRoute };
