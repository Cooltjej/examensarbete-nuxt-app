<!-- components/Navbar.vue -->
<template lang="pug">
  v-app-bar(
    color="orange-darken-1"
    dark
    app
    height="64"
    elevation="4"
  )
    // Left Section: User Avatar with Dropdown and Application Title
    div.d-flex.align-center
      // User Avatar with Dropdown
      v-menu(bottom right)
        template(#activator="{ props }")
          span.mx-3(
            v-bind="props"
            class="cursor-pointer mr-2"
            aria-label="User Menu"
          ) {{ userNamePart }}
        v-list
          v-list-item(@click="signOut")
            v-list-item-title Logout

      // Application Title
      v-toolbar-title Baby Tracker

    // Spacer to push the following elements to the right
    v-spacer

    // Navigation Links (only visible on lg and larger screens)
    NuxtLink(
      v-for="link in navLinks"
      :key="link.to" 
      :to="link.to"
      custom
      v-slot="{ navigate, isActive }"
    )
      v-btn(
        text
        @click="navigate"
        :class="['d-none d-lg-inline', { 'btn-active': isActive }]"
        aria-label="Navigation Link"
      )
        | {{ link.title }}

    // Theme Toggle Button with Dynamic Icon and Tooltip
    v-tooltip(top)
      template(#activator="{ props }")
        v-btn(
          icon
          @click="toggleTheme"
          class="ml-2"
          v-bind="props"
          aria-label="Toggle Theme"
        )
          v-icon {{ themeIcon }}
      span Toggle Theme

    // Hamburger menu (hidden on lg and larger)
    v-app-bar-nav-icon(
      class="d-lg-none ml-2"
      @click="toggleDrawer"
      aria-label="Open Navigation Drawer"
    )
</template>

<script setup>
import { computed } from "vue";
import { defineProps } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";

const auth = useAuthStore();
const router = useRouter();

// Compute the first part of the user's email
const userNamePart = computed(() => {
  if (!auth.user || !auth.user.email) return "";
  return auth.user.email.split("@")[0];
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

// Compute the icon based on the current theme
const themeIcon = computed(() => {
  return theme.global.name.value === "light"
    ? "mdi-weather-night" // Moon icon for dark mode
    : "mdi-weather-sunny"; // Sun icon for light mode
});

function toggleTheme() {
  // Switch between 'light' and 'dark' themes
  theme.global.name.value =
    theme.global.name.value === "light" ? "dark" : "light";
}
</script>

<style scoped>
.btn-active {
  font-weight: bold;
  border-bottom: 2px solid white;
}
.cursor-pointer {
  cursor: pointer;
  transition: color 0.3s;
}

.cursor-pointer:hover {
  color: lighten(#ffffff, 20%); /* Adjust based on your theme */
}

.mr-2 {
  margin-right: 0.5rem; /* Adjust as needed */
}

.ml-2 {
  margin-left: 0.5rem; /* Adjust as needed */
}
</style>
