export async function saveVoiceAudioFile(_response: Response) {
  throw new Error("Native voice audio files are unavailable on web.");
}

export function deleteVoiceAudioFile(_fileUri: string) {}