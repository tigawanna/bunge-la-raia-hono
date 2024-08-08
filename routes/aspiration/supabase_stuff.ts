import SupabaseClient from "https://jsr.io/@supabase/supabase-js/2.44.4/src/SupabaseClient.ts";
import { CandidateAspirationRecordType } from "./validate-record.ts";
import { Database } from "../../supabase/db-types.ts";

interface GetCandidateContext {
  sb: SupabaseClient<Database>;
  record: Partial<CandidateAspirationRecordType> & { id: string };
}
export function getCandidateAspirationContextFromRecord({ sb, record }: GetCandidateContext) {
  try {
    const aspitarion_vibe_string = JSON.stringify(record?.vibe_check);
    return aspitarion_vibe_string;
  } catch (e) {
    throw e;
  }
}

interface GetCandidateAspirationContext {
  sb: SupabaseClient<Database>;
  record: Partial<CandidateAspirationRecordType> & { id: string; embedding?: number[] };
}
export async function updateCandidateAspration({ sb, record }: GetCandidateAspirationContext) {
  return await sb
    .from("candidate_aspirations")
    .update({ ...record })
    .eq("id", record.id)
    .select("*")
    .single();
}
