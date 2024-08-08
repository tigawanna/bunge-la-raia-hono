import SupabaseClient from "https://jsr.io/@supabase/supabase-js/2.44.4/src/SupabaseClient.ts";
import { Database } from "../../supabase/db-types.ts";
import { PublicUserRecordType } from "./validate-record.ts";

interface GetCandidateContext {
  record: Partial<PublicUserRecordType> & { id: string };
}
export function getUserContextFromRecord({record }: GetCandidateContext) {
  try {
    const aspitarion_vibe_string = JSON.stringify(record?.vibe_check);
    return aspitarion_vibe_string;
  } catch (e) {
    throw e;
  }
}

interface GetCandidateAspirationContext {
  sb: SupabaseClient<Database>;
  record: Partial<PublicUserRecordType> & { id: string; embedding?: number[] };
}
export async function updateUser({ sb, record }: GetCandidateAspirationContext) {
  return await sb
    .from("users")
    .update({ ...record })
    .eq("id", record.id)
    .select("*")
    .single();
}
