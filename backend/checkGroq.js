import dotenv from "dotenv";

dotenv.config();

const response = await fetch(
  "https://api.groq.com/openai/v1/models",
  {
    headers: {
      Authorization:
        `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type":
        "application/json",
    },
  }
);

const data = await response.json();

if (!response.ok) {
  console.error(
    "Groq API error:",
    data
  );

  process.exit(1);
}

console.log(
  "Groq models available to this API key:"
);

for (const model of data.data || []) {
  console.log(
    model.id,
    "| active:",
    model.active
  );
}