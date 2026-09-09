export async function visionTool({
  message,
}) {

  return `

The user uploaded an image.

Carefully analyze the image and answer:

${message}

`;

}