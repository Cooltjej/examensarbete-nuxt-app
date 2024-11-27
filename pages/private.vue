<template>
    <div>
        <h1>Welcome!</h1>
        <div>You are signed in with:</div>
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