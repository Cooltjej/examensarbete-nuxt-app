import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  async function createUser(values) {
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
    user.value = userCredential.user
  }

  async function signInUser(values) {
    const auth = getAuth()
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password)
    user.value = userCredential.user
  }

  async function signOutUser() {
    const auth = getAuth()
    await signOut(auth)
    user.value = null
  }

  return {
    user,
    createUser,
    signInUser,
    signOutUser,
  }
}, {
  persist: true,
})