import { genAI } from "./gemini-genai-instance.ts";

interface GenerateEmbeddingInterface {
  inputText: string;
}

export async function geminiEmbedding({ inputText }: GenerateEmbeddingInterface) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(inputText);
    return result;
  } catch (error) {
    console.log(
      "========================== error emssage in geminiEmbedding ======================= ",
      error?.message
    );
    console.log(
      "========================== full error in geminiEmbedding ======================= ",
      error
    );
    throw error;
  }
}
