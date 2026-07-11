import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = "subtle-handbook-z5jvd";
const databaseId = "ai-studio-stockexchange-23e71bbf-2283-4dbb-a0f9-907fd4eff3fc";

let app;
if (!getApps().length) {
  app = initializeApp({ projectId });
} else {
  app = getApps()[0];
}

const firestore = getFirestore(app, databaseId);

export { firestore };
