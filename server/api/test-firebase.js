import { db } from '../utils/firebase-admin';

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  try {
    const snapshot = await db.collection('test').get();
    const data = snapshot.docs.map(doc => doc.data());
    return { success: true, data };
  } catch (error) {
    console.error('Firebase error:', error);
    return { success: false, error: error.message };
  }
});