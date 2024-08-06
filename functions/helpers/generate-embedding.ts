import { genAI } from "./gemini-genai-instance.ts";

interface GenerateEmbeddingInterface {
    inputText: string;
}

export async function geminiEmbedding(
    { inputText }: GenerateEmbeddingInterface,
) {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(inputText);
    return result;
}
