import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { firebase } = config.public
  const app = initializeApp({ ...firebase })
  const auth = getAuth(app)
  const authStore = useAuthStore()

  onAuthStateChanged(auth, (user) => {
    if (user) {
      authStore.user = user
    }
    else {
      authStore.user = null
    }
  })
})