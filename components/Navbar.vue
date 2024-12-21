<!-- components/Navbar.vue -->
<template lang="pug">
  v-app-bar(
    color="primary"
    dark
    app
    height="64"
    elevation="4"
  )
    // Hamburger menu (hidden on lg and larger)
    v-app-bar-nav-icon(
      class="d-lg-none"
      @click="toggleDrawer"
    )

    // Application Title
    v-toolbar-title Baby Tracker

    v-spacer

    // Navigation Links (only visible on lg and larger screens)
    NuxtLink(
      v-for="(link, index) in navLinks"
      :key="index"
      :to="link.to"
      custom
      v-slot="{ navigate, isActive }"
    )
      v-btn(
        text
        @click="navigate"
        :class="['d-none d-lg-inline', { 'btn-active': isActive }]"
      )
        | {{ link.title }}

    // Theme Toggle Button
    v-btn(text @click="toggleTheme") Toggle Theme

    // Append Slot: User Avatar with Dropdown
    template(#append)
      v-menu(bottom right)
        template(#activator="{ props }")
          // Display only the first part of the email
          span(v-bind="props" class="cursor-pointer") {{ userNamePart }}
        v-list
          v-list-item(@click="signOut")
            v-list-item-title Logout
</template>

<script setup>
import { computed } from 'vue';
import { defineProps } from 'vue';
import { useAuthStore } from '~/stores/useAuth';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify'; // Import the theme composable

const auth = useAuthStore();
const router = useRouter();
const userNamePart = computed(() => {
  if (!auth.user || !auth.user.email) return '';
  return auth.user.email.split('@')[0];
});
const props = defineProps({
  toggleDrawer: {
    type: Function,
    required: true,
  },
  userAvatarUrl: {
    type: String,
    default: "/images/user-avatar.jpg",
  },
});

const userName = computed(() => auth.user?.name || "Guest");

const navLinks = [
  { title: "Feedings", to: "/feeding" },
  { title: "Bowel Movements", to: "/bowelmovement" },
  { title: "Sleep", to: "/sleep" },
  { title: "Sickness", to: "/sickness" },
  { title: "Overview", to: "/overview" },
  { title: "Profile", to: "/private" },
];

async function signOut() {
  try {
    await auth.signOutUser();
    router.push("/");
  } catch (error) {
    console.error("Error during sign out:", error);
  }
  router.push("/");
}

// Use Vuetify's theme composable
const theme = useTheme();

function toggleTheme() {
  // Get current theme name
  const current = theme.global.name.value;
  // Switch between 'light' and 'dark'
  theme.global.name.value = current === 'light' ? 'dark' : 'light';
}
</script>

<style scoped>
.btn-active {
  font-weight: bold;
  border-bottom: 2px solid white;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
