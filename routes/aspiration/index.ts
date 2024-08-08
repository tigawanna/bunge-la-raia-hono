import { Hono } from "hono";
import { CandidateRecordType, validateCandidate } from "../../helpers/validate-record.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.44.4";
import { Database } from "../../supabase/db-types.ts";
import { geminiEmbedding } from "../../helpers/generate-embedding.ts";
import { getCandidateAspirationContextFromRecord, updateCandidateAspration } from "./supabase_stuff.ts";

interface SummarizeRequestBody {
  record: CandidateRecordType;
}
const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "candidate aspiration route" });
});
app.post("/embed", async (c) => {
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
    const candidateContext = await getCandidateAspirationContextFromRecord({
      sb: supabaseClient,
      record,
    });
    const embeddingResult = await geminiEmbedding({
      inputText: candidateContext,
    });
    // update candidate embedding
    const { error: updateCandidateEmbeddingError } = await updateCandidateAspration({
      sb: supabaseClient,
      //@ts-expect-error: this might be wrong
      record: { id: record.id, embedding: embeddingResult.embedding.values },
    });
    if (updateCandidateEmbeddingError) {
      return c.json(
        { message: "candidate aspiration embedding update failed" + updateCandidateEmbeddingError.message },
        400
      );
    }
    return c.json({ message: "candidate aspiration summary + embedding updated successfully" }, 200);
  } catch (error) {
    return c.json({ message: "Something went wrong: " + error.message }, 500);
  }
});



export { app as candidateRoute };
