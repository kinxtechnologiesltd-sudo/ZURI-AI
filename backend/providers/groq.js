const DEFAULT_OPTIONS = {
  temperature: 0.7,
  max_tokens: 4096,
};

export async function chatWithGroq(
  messages,
  model,
  options = {}
) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        ...DEFAULT_OPTIONS,
        ...options,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return await response.json();
}

export async function streamWithGroq(
  messages,
  model,
  options = {}
) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        ...DEFAULT_OPTIONS,
        ...options,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.body;
}