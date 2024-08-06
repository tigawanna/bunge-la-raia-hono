import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  PublicUserRecordType,
  validateUser,
} from "../helpers/validate-record.ts";
import { createClient } from "jsr:@supabase/supabase-js";
import { Database } from "../database.ts";
import { geminiEmbedding } from "../helpers/generate-embedding.ts";


interface RequestBody {
  record: PublicUserRecordType;
}

Deno.serve(async (req) => {
  try {
    const { record } = (await req.json()) as RequestBody;

    const raw_string_input = validateUser(record);
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
      .from("users")
      .update({
        embedding: embeddingResult.embedding.values,
        last_proompted_on: new Date().toISOString(),
      })
      .eq("id", record.id)
      .select("*")
      .single();

    if (error) {
      throw new Error("error embedding aspiration :" + error.message, {
        cause: error.details,
      });
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
