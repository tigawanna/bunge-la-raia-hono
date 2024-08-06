import  { GoogleGenerativeAI } from "npm:@google/generative-ai"


const apiKey = Deno.env.get("GEMINI_API_KEY");
if(!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}
export const genAI = new GoogleGenerativeAI(apiKey);
