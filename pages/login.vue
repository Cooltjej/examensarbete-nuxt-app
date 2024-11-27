<template>
  <div>
      <Header />
      <div>Signed in:</div>
      <div>Email: {{ auth.user.email }}</div>
      <div>Uid: {{ auth.user.uid }}</div>
  </div>
</template>

<script setup>
definePageMeta({
middleware: ['auth'],
})
const auth = useAuthStore()
</script>