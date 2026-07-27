import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";

import {
    auth,
    db,
} from "../firebase/firebaseConfig";

export type ZuriMemory = {
  id: string;
  content: string;
};

export async function getMemories(): Promise<
  ZuriMemory[]
> {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const memoriesRef = collection(
    db,
    "users",
    user.uid,
    "memories"
  );

  const memoriesQuery = query(
    memoriesRef,
    orderBy("createdAt", "desc")
  );

  const snapshot =
    await getDocs(memoriesQuery);

  return snapshot.docs.map((memoryDoc) => ({
    id: memoryDoc.id,
    content:
      memoryDoc.data().content || "",
  }));
}

export async function addMemory(
  content: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to save a memory."
    );
  }

  const cleanContent = content.trim();

  if (!cleanContent) {
    throw new Error(
      "Memory cannot be empty."
    );
  }

  const memoriesRef = collection(
    db,
    "users",
    user.uid,
    "memories"
  );

  await addDoc(memoriesRef, {
    content: cleanContent,
    createdAt: serverTimestamp(),
  });
}

export async function deleteMemory(
  memoryId: string
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in."
    );
  }

  const memoryRef = doc(
    db,
    "users",
    user.uid,
    "memories",
    memoryId
  );

  await deleteDoc(memoryRef);
}