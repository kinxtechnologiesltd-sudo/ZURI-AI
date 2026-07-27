import { onAuthStateChanged } from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
} from "firebase/firestore";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    auth,
    db,
} from "../firebase/firebaseConfig";

type VoiceGender = "female" | "male";

type ResponseStyle =
  | "balanced"
  | "professional"
  | "friendly"
  | "creative";

type ResponseLength =
  | "concise"
  | "balanced"
  | "detailed";

type PreferencesContextType = {
  voiceGender: VoiceGender;
  setVoiceGender: (voice: VoiceGender) => void;

  preferredName: string;
  setPreferredName: (name: string) => void;

  responseStyle: ResponseStyle;
  setResponseStyle: (
    style: ResponseStyle
  ) => void;

  responseLength: ResponseLength;
  setResponseLength: (
    length: ResponseLength
  ) => void;

  preferencesLoading: boolean;
};

const PreferencesContext =
  createContext<
    PreferencesContextType | undefined
  >(undefined);

export function PreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [voiceGender, setVoiceGender] =
    useState<VoiceGender>("female");

  const [preferredName, setPreferredName] =
    useState("");

  const [responseStyle, setResponseStyle] =
    useState<ResponseStyle>("balanced");

  const [responseLength, setResponseLength] =
    useState<ResponseLength>("balanced");

  const [
    preferencesLoading,
    setPreferencesLoading,
  ] = useState(true);

  // Prevent saving default values before
  // Firestore preferences have finished loading.
  const hasLoadedPreferences = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        hasLoadedPreferences.current = false;
        setPreferencesLoading(true);

        if (!user) {
          setVoiceGender("female");
          setPreferredName("");
          setResponseStyle("balanced");
          setResponseLength("balanced");

          hasLoadedPreferences.current = true;
          setPreferencesLoading(false);
          return;
        }

        try {
          const preferenceRef = doc(
            db,
            "userPreferences",
            user.uid
          );

          const snapshot =
            await getDoc(preferenceRef);

          if (snapshot.exists()) {
            const data = snapshot.data();

            if (
              data.voiceGender === "female" ||
              data.voiceGender === "male"
            ) {
              setVoiceGender(
                data.voiceGender
              );
            }

            if (
              typeof data.preferredName ===
              "string"
            ) {
              setPreferredName(
                data.preferredName
              );
            }

            if (
              [
                "balanced",
                "professional",
                "friendly",
                "creative",
              ].includes(data.responseStyle)
            ) {
              setResponseStyle(
                data.responseStyle
              );
            }

            if (
              [
                "concise",
                "balanced",
                "detailed",
              ].includes(
                data.responseLength
              )
            ) {
              setResponseLength(
                data.responseLength
              );
            }
          }
        } catch (error) {
          console.error(
            "Failed to load preferences:",
            error
          );
        } finally {
          hasLoadedPreferences.current = true;
          setPreferencesLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const savePreferences = async () => {
      const user = auth.currentUser;

      if (
        !user ||
        !hasLoadedPreferences.current
      ) {
        return;
      }

      try {
        const preferenceRef = doc(
          db,
          "userPreferences",
          user.uid
        );

        await setDoc(
          preferenceRef,
          {
            voiceGender,
            preferredName,
            responseStyle,
            responseLength,
            updatedAt: new Date(),
          },
          {
            merge: true,
          }
        );
      } catch (error) {
        console.error(
          "Failed to save preferences:",
          error
        );
      }
    };

    savePreferences();
  }, [
    voiceGender,
    preferredName,
    responseStyle,
    responseLength,
  ]);

  return (
    <PreferencesContext.Provider
      value={{
        voiceGender,
        setVoiceGender,

        preferredName,
        setPreferredName,

        responseStyle,
        setResponseStyle,

        responseLength,
        setResponseLength,

        preferencesLoading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(
    PreferencesContext
  );

  if (!context) {
    throw new Error(
      "usePreferences must be used inside PreferencesProvider"
    );
  }

  return context;
}