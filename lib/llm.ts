const baseUrl = () => {
  const url = process.env.LLAMA_API_URL ?? "";
  return url.replace(/\/$/, "");
};

export async function generateText(prompt: string, maxTokens = 2048): Promise<string> {
  const url = baseUrl();
  if (!url) throw new Error("LLAMA_API_URL is not set");
  try {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.LLAMA_MODEL ?? "llama",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `LLM request failed: ${res.status}`);
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; text?: string; completion?: string };
    if (data.choices?.[0]?.message?.content != null) return data.choices[0].message.content.trim();
    if (typeof data.text === "string") return data.text.trim();
    if (typeof data.completion === "string") return data.completion.trim();
    throw new Error("Unexpected LLM response shape");
  }
}
