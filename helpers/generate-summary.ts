/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

import { genAI } from "./gemini-genai-instance.ts";

interface GenerateCandidateVibeSummary {
  inputText: string;
}
export async function generateCandidateVibeSummary(
  { inputText }: GenerateCandidateVibeSummary,
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      `this is civilization game modelled on the kenyan political system , 
      based on the query answer combinations make a semi detailed summary of the candidate
       and below that highlight their strong points and concerns about them in markdown`,
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  const chatSession = model.startChat({
    generationConfig,
  });
  const result = await chatSession.sendMessage(inputText);
  // console.log(result.response.text());
  return result;
}

interface GenerateUserSummary {
  inputText: string;
}
export async function generateUserSummary({ inputText }: GenerateUserSummary) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      `this is civilization game modelled on the kenyan political system , 
      based on the query answer combinatiosn make a semi detalied summary of the player below ,
       based on the input highlight what their main frustrtions re an what they expect
       from their leaders in markdown`,
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  const chatSession = model.startChat({
    generationConfig,
  });
  const result = await chatSession.sendMessage(inputText);
  // console.log(result.response.text());
  return result;
}
