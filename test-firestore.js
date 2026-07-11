import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ projectId: "subtle-handbook-z5jvd" });
const db = getFirestore(app, "ai-studio-stockexchange-23e71bbf-2283-4dbb-a0f9-907fd4eff3fc");
console.log(db.databaseId);
