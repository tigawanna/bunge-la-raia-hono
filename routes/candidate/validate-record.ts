import { timestampToDays } from "../../helpers/timestamp.ts";
import { Database } from "../../supabase/db-types.ts";




export type CandidateRecordType = Database["public"]["Tables"]["candidates"]["Row"] & {
  embedding?: number[];
  vibe_check: Array<{ query: string; answer: string }>;
};
export function validateCandidate(record: CandidateRecordType) {
  if (!record) {
    return new Response("No record found", { status: 400 });
  }
  const last_proompted = timestampToDays(record.last_proompted_on);
  const can_prrompt_right_now = last_proompted > 4;
  if (record.last_proompted_on && !can_prrompt_right_now) {
    return new Response(
      `weekly prompt limit reached. please try again in ${5 - last_proompted} days`,
      { status: 422 }
    );
  }
  if (!record?.bio || record?.bio.length < 10) {
    return new Response("Not enough candidate bio data ", { status: 400 });
  }
  if (!record.vibe_check || record.vibe_check?.length === 0) {
    return new Response("No vibe check found", { status: 400 });
  }
  const vibe_check = JSON.stringify(record?.vibe_check);
  if (vibe_check.length < 100) {
    return new Response("Not enough vibe check data ", { status: 400 });
  }

  const raw_string_input = `My name is ${record.name} and my bio is : ${record.bio}
    my vibe check quiz questions and answers are ${vibe_check}`;
  return raw_string_input;
}

