import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { geminiEmbedding } from "../helpers/generate-embedding.ts";
import { Database } from "../database.ts";
import { createClient } from "jsr:@supabase/supabase-js";
import {
  CandidateRecordType,
  validateCandidate,
} from "../helpers/validate-record.ts";

interface RequestBody {
  record: CandidateRecordType;
}

Deno.serve(async (req) => {
  try {
    const { record } = (await req.json()) as RequestBody;

    const raw_string_input = validateCandidate(record);
    if (raw_string_input instanceof Response) {
      return raw_string_input;
    }

    const authHeader = req.headers.get("Authorization")!;
    const embeddingResult = await geminiEmbedding({
      inputText: raw_string_input,
    });
    const supabaseClient = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data, error } = await supabaseClient
      .from("candidates")
      .update({
        embedding: embeddingResult,
        last_proompted_on: new Date().toISOString(),
      })
      .eq("id", record.id)
      .select("*")
      .single();

    if (error) {
      throw new Error("error embedding aspiration :", error.message);
    }

    return new Response(
      "aspiration embedding " + data?.id + " updated successfully",
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response("Something went wrong: " + error.message, {
      status: 500,
    });
  }
});
