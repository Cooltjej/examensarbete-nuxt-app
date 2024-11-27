<template>
    <header class="bg-gray-700">
    <nav class="container mx-auto p-4 flex justify-end text-white">
      <button class="hover:text-amber-500" @click="signOut">
        Sign Out
      </button>
    </nav>
  </header>
</template>

<script setup>
const auth = useAuthStore()
const router = useRouter()


async function signOut() {
  router.push({ path: "/" })
  await auth.signOutUser()

}
</script>