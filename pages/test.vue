<template>
    <div>
      <h1>Firebase Auth Test</h1>
      <p v-if="$auth">Auth is initialized</p>
      <p v-else>Auth is not initialized</p>
    </div>
  </template>
  
  <script setup lang="ts">
  const { $auth } = useNuxtApp();
  console.log('$auth:', $auth);
  </script>
  