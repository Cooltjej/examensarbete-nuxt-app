<template lang="pug">
    v-app
      Navbar(:toggleDrawer="toggleDrawer")
      v-main
        NuxtPage
    </template>

<script setup>
import { ref } from "vue";

const drawer = ref(false);
const toggleDrawer = () => (drawer.value = !drawer.value);
</script>
