import { Linking } from "react-native";

export function saveGeneratedImage(imageUrl: string) {
  return Linking.openURL(imageUrl);
}