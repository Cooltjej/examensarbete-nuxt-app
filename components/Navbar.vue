<template lang="pug">
    v-app-bar(
      color="primary"
      dark
      app
      height="64"
      elevation="4"
    )
      v-app-bar-nav-icon(@click="toggleDrawer")
      
      //- Application Title
      v-toolbar-title Baby Tracker
      
      v-spacer
      
      //- Navigation Links (Hidden on Small Screens)
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
          :class="['d-none d-md-inline', { 'btn-active': isActive }]"
        ) {{ link.title }}
      
      //- Append Slot: User Avatar with Dropdown
      template(#append)
        v-menu
          template(#activator="{ props }")
            v-avatar(
              v-bind="props"
              class="cursor-pointer"
            )
              img(:src="userAvatarUrl" alt="User Avatar")
          v-list
            v-list-item(
              @click="signOut"
            )
              v-list-item-title Logout
    </template>

<script setup>
import { defineProps } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useRouter } from "vue-router";

const auth = useAuthStore();

async function signOut() {
  try {
    await auth.signOutUser();
    router.push("/");
  } catch (error) {
    console.error("Error during sign out:", error);
  }
  router.push("/");
}
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

const authStore = useAuthStore();
const router = useRouter();
const userName = computed(() => authStore.user?.name || "Guest");

const navLinks = [
  { title: "Feedings", to: "/feeding" },
  { title: "Bowel Movements", to: "/bowelmovement" },
  { title: "Sleep", to: "/sleep" },
  { title: "Sickness", to: "/sickness" },
  { title: "Overview", to: "/overview" },
  { title: "Profile", to: "/private" },
];

// Logout Function
const logout = () => {
  authStore.logout();
  router.push("/login"); // Redirect to login page after logout
};
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
