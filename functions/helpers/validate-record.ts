import { Database } from "../database.ts";
import { timestampToDays } from "./timestamp.ts";

export type CandidateAspirationRecordType =
  & Database["public"]["Tables"]["candidate_aspirations"]["Row"]
  & {
    vibe_check: Array<{ query: string; answer: string }>;
  };

export function validateAspiration(record: CandidateAspirationRecordType) {
  if (!record) {
    return new Response("No record found", { status: 400 });
  }
  // check if record.last_proompted_on is not older yhan 5 days
  const last_proompted = timestampToDays(record.last_proompted_on);
  const can_prrompt_right_now = last_proompted > 4;
  if (record.last_proompted_on && !can_prrompt_right_now) {
    return new Response(
      `weekly prompt limit reached. please try again in ${
        5 - last_proompted
      } days`,
      { status: 422 },
    );
  }
  if (record?.mission_statement.length < 10) {
    return new Response("Not enough mission statement data ", { status: 400 });
  }
  if (!record.vibe_check || record.vibe_check?.length === 0) {
    return new Response("No vibe check found", { status: 400 });
  }
  const vibe_check = JSON.stringify(record?.vibe_check);
  if (vibe_check.length < 100) {
    return new Response("Not enough vibe check data ", { status: 400 });
  }

  const raw_string_input = `i am vying for ${record.vying_for} in
    ${record.vying_in} period ${record.period}
    my mission statement is : ${record.mission_statement}
    my vibe check quiz questions and answers are ${vibe_check}`;
  return raw_string_input;
}




export type CandidateRecordType =
  & Database["public"]["Tables"]["candidates"]["Row"]
  & {
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
      `weekly prompt limit reached. please try again in ${
        5 - last_proompted
      } days`,
      { status: 422 },
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

  const raw_string_input =
    `My name is ${record.name} and my bio is : ${record.bio}
    my vibe check quiz questions and answers are ${vibe_check}`;
  return raw_string_input;
}






export type PublicUserRecordType =
  & Database["public"]["Tables"]["users"]["Row"]
  & {
    vibe_check: Array<{ query: string; answer: string }>;
  };

  
export function validateUser(record: PublicUserRecordType) {
  if (!record) {
    return new Response("No record found", { status: 400 });
  }
  const last_proompted = timestampToDays(record?.last_proompted_on);
  const can_prrompt_right_now = last_proompted > 4;
  if (record?.last_proompted_on && !can_prrompt_right_now) {
    return new Response(
      `weekly prompt limit reached. please try again in ${
        5 - last_proompted
      } days`,
      { status: 422 },
    );
  }
  if (!record?.bio || record?.bio.length < 10) {
    return new Response("Not enough user bio data ", { status: 400 });
  }
  if (!record.vibe_check || record.vibe_check?.length === 0) {
    return new Response("No vibe check found", { status: 400 });
  }
  const vibe_check = JSON.stringify(record?.vibe_check);
  if (vibe_check.length < 100) {
    return new Response("Not enough vibe check data ", { status: 400 });
  }

  const raw_string_input =
    `My name is ${record.username} and my mission statement is : ${record.bio}
    my vibe check quiz questions and answers are ${vibe_check}`;
  return raw_string_input;
}
