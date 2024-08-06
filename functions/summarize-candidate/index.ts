import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "jsr:@supabase/supabase-js";
import { Database } from "../database.ts";
import {
  CandidateRecordType,
  validateCandidate,
} from "../helpers/validate-record.ts";
import { generateCandidateVibeSummary } from "../helpers/generate-summary.ts";

interface RequestBody {
  record: CandidateRecordType;
}
Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { record } = (await req.json()) as RequestBody;
    const raw_string_input = validateCandidate(record);
    if (raw_string_input instanceof Response) {
      return raw_string_input;
    }

    //  get candidate aspiration summary

    const { data: aspirations } = await supabaseClient
      .from("candidate_aspirations")
      .select("*")
      .eq("id", record.id)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    const aspirations_text = aspirations?.reduce(
      // @ts-expect-error supabase types are acting up here
      (acc, curr, idx) => {
        const aspiration =
          ` period: ${curr.period} vying_for: ${curr.vying_for} vying in ${curr.vying_in} 
            mission statement: ${curr.mission_statement} vibe_check: ${
            JSON.stringify(curr.vibe_check)
          }`;
        acc += `${idx + 1}. ${aspiration}\n`;
        return acc;
      },
      "",
    );

    const summary = await generateCandidateVibeSummary({
      inputText: raw_string_input + "\n" + "the candidate's other aspirations include:" + aspirations_text,
    });
    const summary_text = summary.response.text();

    if (!summary || !summary?.response) {
      return new Response("candidate summary generation failed", {
        status: 400,
      });
    }
    const { data, error } = await supabaseClient.from("candidates")
      .update({
        candidate_summary: summary_text,
        last_proompted_on:new Date().toISOString()
      })
      .eq("id", record.id)
      .select("*")
      .single();
    if (error) {
      return new Response(
        "updating candidate summary failed :" + error.message,
        { status: 400 },
      );
    }
    return new Response(
      "candidate summary " + data?.id + " updated successfully",
      { status: 200 },
    );
  } catch (error) {
    return new Response("Something went wrong: " + error.message, {
      status: 500,
    });
  }
});
