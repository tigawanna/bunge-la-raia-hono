import { genAI } from "./gemini-genai-instance.ts";

interface ChatWithProps {
  context_text: string;
  prompt: string;
}
export async function chatWith({ context_text }: ChatWithProps) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `this is civilization game modelled on the kenyan political system , 
      a user has some questions about this candidate ,impersonate the candidate based on the provided context try and give answers under 
      100 words`,
    });

    const promptString = `=================== start of context ===================
  ${context_text}
  ==================== end of context ===================
  user question ==== ${prompt}
  `;

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
    const result = await chatSession.sendMessage(promptString);
    return result;
  } catch (error) {
    console.log(
      "========================== error emssage in chatWith ======================= ",
      error?.message
    );
    console.log(
      "========================== full error in chatWith ======================= ",
      error
    );
    throw error;
  }
}
