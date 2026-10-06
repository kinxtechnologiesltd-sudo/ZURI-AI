import { File, Paths } from "expo-file-system";

export async function saveVoiceAudioFile(response: Response) {
  const contentType = response.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  const audioExtension =
    contentType === "audio/wav" ||
    contentType === "audio/x-wav"
      ? "wav"
      : contentType === "audio/ogg"
        ? "ogg"
        : contentType === "audio/mp4"
          ? "m4a"
          : contentType === "audio/aac"
            ? "aac"
            : contentType === "audio/webm"
              ? "webm"
              : "mp3";
  const audioFile = new File(
    Paths.cache,
    `zuri-reply-${Date.now()}.${audioExtension}`
  );
  audioFile.write(
    new Uint8Array(await response.arrayBuffer())
  );

  return audioFile.uri;
}

export function deleteVoiceAudioFile(fileUri: string) {
  new File(fileUri).delete();
}