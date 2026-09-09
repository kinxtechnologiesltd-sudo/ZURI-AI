import { ENV } from "./config/environment.js";

const url =
  "https://api.lumalabs.ai/dream-machine/v1/generations";

const body = {
  prompt:
    "A cinematic shot of a confident young African woman walking through Kaduna at golden hour, natural movement, warm sunset lighting.",

  model:
    "ray-2",

  resolution:
    "720p",

  duration:
    "5s",
};

console.log(
  "Luma key loaded:",
  Boolean(ENV.LUMA_API_KEY)
);

console.log(
  "Sending Luma generation request..."
);

console.log(
  "Luma URL:",
  url
);

console.log(
  "Luma body:",
  body
);
const key =
  String(
    ENV.LUMA_API_KEY || ""
  ).trim();

console.log(
  "Luma key loaded:",
  Boolean(key)
);

console.log(
  "Luma key length:",
  key.length
);

console.log(
  "Uses current Luma API key format:",
  key.startsWith("luma-api-")
);
const response =
  await fetch(
    url,
    {
      method: "POST",

      headers: {
        accept:
          "application/json",

        authorization:
          `Bearer ${ENV.LUMA_API_KEY}`,

        "content-type":
          "application/json",
      },

      body:
        JSON.stringify(body),
    }
  );

console.log(
  "Luma HTTP status:",
  response.status
);

console.log(
  "Luma response:",
  await response.text()
);