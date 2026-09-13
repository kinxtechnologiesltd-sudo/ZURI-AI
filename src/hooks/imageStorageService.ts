export const uploadGeneratedImage = async (
  imageUrl: string
) => {
  const cloudName = "ghzok84q";
  const uploadPreset = "athena_generated_images";

  const formData = new FormData();

  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error("Failed to download generated image.");
  }

  const blob = await imageResponse.blob();

  formData.append("file", blob, "zuri-generated-image.png");
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "athena/generated-images");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Cloudinary upload error:",
      JSON.stringify(data, null, 2)
    );

    throw new Error(
      data.error?.message ||
        "Failed to save generated image."
    );
  }

  console.log(
    "Image successfully saved to Cloudinary:",
    data.secure_url
  );

  return data.secure_url;
};