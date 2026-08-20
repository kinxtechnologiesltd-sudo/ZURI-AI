import fs from "fs";
import { generateFalComic } from "./providers/falComics.js";

async function testFal() {
  try {
    console.log(
      "🧪 Testing Fal comic + Zuri watermark..."
    );

    const result =
      await generateFalComic({
        prompt: `
Create a vibrant comic-book illustration
about a young African inventor working in
a small community technology lab.

Show the inventor building a small friendly
robot while other young African innovators
work together around her.

Authentic African environment,
expressive characters,
clean comic-book linework,
beautiful cel shading,
dynamic composition,
warm lighting,
hopeful futuristic atmosphere,
highly detailed,
professional comic illustration.

No text, no speech bubbles, no watermark.
        `,
      });

    fs.mkdirSync(
      "./generated",
      { recursive: true }
    );

    fs.writeFileSync(
      "./generated/fal-comic-watermarked.png",
      result.buffer
    );

    console.log(
      "✅ FAL + WATERMARK TEST COMPLETE"
    );

    console.log(
      "📁 Saved to:",
      "./generated/fal-comic-watermarked.png"
    );

  } catch (error) {
    console.error(
      "❌ FAL TEST FAILED:"
    );

    console.error(error);
  }
}

testFal();