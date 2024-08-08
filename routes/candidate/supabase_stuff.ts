import { SupabaseClient } from "jsr:@supabase/supabase-js@2.44.4";
import { Database } from "../../supabase/db-types.ts";
import { CandidateRecordType } from "../../helpers/validate-record.ts";

interface GetCandidateContextFromID {
  sb: SupabaseClient<Database>;
  candidate_id: string;
}
export async function getCandidateContextFromID({ sb, candidate_id }: GetCandidateContextFromID) {
  try {
    //  get candidate's most recent spirations
    const { data: candidate} = await sb
      .from("candidates")
      .select("*")
      .eq("id", candidate_id)
      .select("*")
      .single();
    const { data: aspirations } = await sb
      .from("candidate_aspirations")
      .select("*")
      .eq("candidate_id", candidate_id)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    const { data: reviews} = await sb
      .from("candidate_reviews")
      .select("*")
      .eq("candidate_id", candidate_id)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    // if (error) throw error;
    // if (review_error) throw review_error;
    // aggregate apsirations into  into a string
    const candidate_text = `candidate general vibe check: ${JSON.stringify(
      candidate?.vibe_check
    )}\n`;

    const aspirations_text = aspirations?.reduce((acc, curr, idx) => {
      const aspiration = ` period: ${curr.period} 
        vying_for: ${curr.vying_for} vying in ${curr.vying_in} 
        mission statement: ${curr.mission_statement} vibe_check: ${JSON.stringify(
        curr.vibe_check
      )}`;
      acc += `${idx + 1}. ${aspiration}\n`;
      return acc;
    }, "past and present aspirations by the candidate include :\n");

    if (reviews && reviews?.length > 0) {
      //  aggregate reviews into a string
      const reviews_text = reviews?.reduce((acc, curr, idx) => {
        const review = ` was rated: ${curr.rating}/5 
        with comment: ${curr.comment} `;
        acc += `${idx + 1}. ${review}\n`;
        return acc;
      }, "reviews by the users include :\n");

      return candidate_text + "\n" + aspirations_text + "\n" + reviews_text;
    }
    return candidate_text + aspirations_text;
  } catch (e) {
    throw e;
  }
}

interface GetCandidateContext {
  sb: SupabaseClient<Database>;
  record: Partial<CandidateRecordType> & { id: string };
}
export async function getCandidateContextFromRecord({ sb, record }: GetCandidateContext) {
  try {
    //  get candidate's most recent spirations
    const { data: aspirations, error } = await sb
      .from("candidate_aspirations")
      .select("*")
      .eq("candidate_id", record.id)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    const { data: reviews, error: review_error } = await sb
      .from("candidate_reviews")
      .select("*")
      .eq("candidate_id", record.id)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    if (review_error) throw review_error;
    // aggregate apsirations into  into a string
    const aspirations_text = aspirations?.reduce((acc, curr, idx) => {
      const aspiration = ` period: ${curr.period} 
        vying_for: ${curr.vying_for} vying in ${curr.vying_in} 
        mission statement: ${curr.mission_statement} vibe_check: ${JSON.stringify(
        curr.vibe_check
      )}`;
      acc += `${idx + 1}. ${aspiration}\n`;
      return acc;
    }, `candidate general vibe check: ${JSON.stringify(record?.vibe_check)}\n`);
    if (reviews.length > 0) {
      //  aggregate reviews into a string
      const reviews_text = reviews?.reduce((acc, curr, idx) => {
        const review = ` was rated: ${curr.rating}/5 
    with comment: ${curr.comment} `;
        acc += `${idx + 1}. ${review}\n`;
        return acc;
      }, "reviews by the users include :\n");

      return aspirations_text + "\n" + reviews_text;
    }
    return aspirations_text;
  } catch (e) {
    throw e;
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
