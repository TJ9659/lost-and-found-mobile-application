import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export async function saveNotification(
  userId: string | number,
  title: string,
  body: string,
  extra: Record<string, any> = {}
) {
  if (!userId) {
    console.error("saveNotification called without a userId");
    return;
  }

  const userIdStr = String(userId).trim();

  await addDoc(
    collection(db, "notifications", userIdStr, "userNotifications"),
    {
      title,
      body,
      read: false,
      ...extra,
      createdAt: serverTimestamp(),
    }
  );
}
