import sharp from "sharp";

export async function validateUploadedImage(buffer) {
  try {
    const metadata = await sharp(buffer, {
      limitInputPixels: 40_000_000,
    }).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Image dimensions are missing.");
    }

    return metadata;
  } catch {
    const error = new Error(
      "The image is corrupted or has unsupported dimensions."
    );
    error.statusCode = 422;
    throw error;
  }
}

export async function editUploadedImage(buffer, operation) {
  if (!Buffer.isBuffer(buffer) || !operation) {
    throw new Error("An image and supported edit operation are required.");
  }

  await validateUploadedImage(buffer);
  const image = sharp(buffer, {
    limitInputPixels: 40_000_000,
  });

  if (operation.type === "square-crop") {
    const metadata = await image.metadata();
    const edge = Math.min(metadata.width || 0, metadata.height || 0);

    if (!edge) {
      throw new Error("The uploaded image has invalid dimensions.");
    }

    return image
      .resize(edge, edge, {
        fit: "cover",
        position: "centre",
      })
      .png()
      .toBuffer();
  }

  if (operation.type === "resize") {
    return image
      .resize(operation.width, operation.height, {
        fit: "fill",
      })
      .png()
      .toBuffer();
  }

  throw new Error("This image edit is not supported.");
}
