import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Importera Firestore-funktioner

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);

  async function createUser(values) {
    const auth = getAuth();
    const db = getFirestore(); // Initiera Firestore

    // Skapa användaren i Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    user.value = userCredential.user;

    // Lägg till användaren i Firestore under 'users'-kollektionen
    await setDoc(doc(db, 'users', user.value.uid), {
      name: values.name,
      email: values.email,
      createdAt: new Date().toISOString(),
    });
  }

  async function signInUser(values) {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    user.value = userCredential.user;
  }

  async function signOutUser() {
    const auth = getAuth();
    await signOut(auth);
    user.value = null;
  }

  return {
    user,
    createUser,
    signInUser,
    signOutUser,
  };
}, {
  persist: true,
});
