import { SupabaseClient } from "jsr:@supabase/supabase-js@2.44.4";
import { Database } from "../../supabase/db-types.ts";
import { CandidateRecordType } from "../../helpers/validate-record.ts";

interface GetCandidateContext {
  sb: SupabaseClient<Database>;
  record: Partial<CandidateRecordType>&{id: string};
}
export async function getCandidateContext({sb,record}: GetCandidateContext) {
    try {
      //  get candidate's most recent spirations
      const { data: aspirations, error } = await sb
        .from("candidate_aspirations")
        .select("*")
        .eq("id", record.id)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
        if(error) throw error
      // aggregate into a string
      const aspirations_text = aspirations?.reduce((acc, curr, idx) => {
        const aspiration = ` period: ${curr.period} 
        vying_for: ${curr.vying_for} vying in ${curr.vying_in} 
        mission statement: ${curr.mission_statement} vibe_check: ${JSON.stringify(
          curr.vibe_check
        )}`;
        acc += `${idx + 1}. ${aspiration}\n`;
        return acc;
      }, `candidate general vibe check: ${JSON.stringify(record?.vibe_check)}\n`);
      return aspirations_text;
    } catch (e) {
     throw e   
    }
}


export async function updateCandidate({ sb, record }: GetCandidateContext) {
return await sb
      .from("candidates")
      .update({ ...record })
      .eq("id", record.id)
      .select("*")
      .single();
}
