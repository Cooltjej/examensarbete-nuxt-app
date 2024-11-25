<template>
  <div>
    <h1>Firebase Test</h1>
    <p v-if="data">{{ data }}</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
const { data, error } = await useFetch('/api/test-firebase');
</script>
