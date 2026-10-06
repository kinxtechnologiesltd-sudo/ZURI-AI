import { Alert } from "react-native";
import { File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export async function saveGeneratedImage(imageUrl: string) {
  let temporaryFile: File | null = null;

  try {
    const currentPermission = await MediaLibrary.getPermissionsAsync(
      true,
      ["photo"]
    );
    const permission = currentPermission.granted
      ? currentPermission
      : await MediaLibrary.requestPermissionsAsync(true, ["photo"]);

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Zuri needs permission to save images to your gallery."
      );
      return;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Image download failed (${response.status}).`);
    }

    const contentType = response.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();
    const urlExtension = imageUrl
      .split(/[?#]/)[0]
      .match(/\.(png|jpe?g|webp|gif)$/i)?.[1]
      ?.toLowerCase();
    const imageExtension = contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : contentType === "image/gif"
          ? "gif"
          : contentType === "image/jpeg" || urlExtension === "jpg" || urlExtension === "jpeg"
            ? "jpg"
            : urlExtension || "jpg";

    temporaryFile = new File(
      Paths.cache,
      `zuri-image-${Date.now()}.${imageExtension}`
    );
    temporaryFile.write(
      new Uint8Array(await response.arrayBuffer())
    );
    await MediaLibrary.Asset.create(temporaryFile.uri);

    Alert.alert(
      "Image Saved",
      "Your image has been saved to your gallery."
    );
  } catch (error) {
    console.error("Generated image save failed:", error);
    Alert.alert(
      "Unable to Save Image",
      error instanceof Error
        ? error.message
        : "Please try again."
    );
  } finally {
    temporaryFile?.delete();
  }
}