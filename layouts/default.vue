<!-- layouts/default.vue -->
<template lang="pug">
  v-app
    Navbar(:toggleDrawer="toggleDrawer")
    v-navigation-drawer(
      v-model="drawer"
      app
      clipped
      color="grey lighten-4"
      border="sm"
      temporary
      class="d-lg-none"
    )
      v-list
        v-list-item(
          v-for="(link, i) in navLinks"
          :key="i"
          link
          :to="link.to"
        )
          v-list-item-title {{ link.title }}

    v-main
      NuxtPage
</template>

<script setup>
import { ref } from "vue";

const drawer = ref(false);
const toggleDrawer = () => (drawer.value = !drawer.value);

const navLinks = [
  { title: "Feedings", to: "/feeding" },
  { title: "Bowel Movements", to: "/bowelmovement" },
  { title: "Sleep", to: "/sleep" },
  { title: "Sickness", to: "/sickness" },
  { title: "Overview", to: "/overview" },
  { title: "Profile", to: "/private" },
];
</script>

<style scoped>
/* Layout-specific styles here */
</style>
