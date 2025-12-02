export type RAGContext = {
  text: string;
  ref: string;
};
export function buildPrompt(question: string, contexts: RAGContext[]) {
  const contextBlocks = contexts
    .map((c, i) => `[${i + 1}] ${c.ref}\n${c.text}`)
    .join("\n\n");
  return `You are a helpful assistant. Answer strictly from the provided context. If the answer is not in the context, say you don't know.

Question:
${question}

Context:
${contextBlocks}

Answer in Serbian, concise, with numbered references [1], [2], ...`;
}
