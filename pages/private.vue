<template lang="pug">
  v-container
    v-row
      v-col(cols="12")
        h1 Welcome!
        div You are signed in with:
        div Email: {{ auth.user.email }}
        div Uid: {{ auth.user.uid }}
        br
        // Här har du redan ChildInfo i koden, men vi antar att du använder den fortfarande
        child-info
  
        br
        // Ny knapp för att gå till bowel movement-sidan
        v-btn(@click="goToBowelMovementPage" color="primary") Bowel Movement
        br
        v-btn(@click="goToSleepPage" color="primary") Sleep
        br
        v-btn(@click="goToFeedingPage" color="primary") Feeding
        br
        v-btn(@click="goToSicknessPage" color="primary") Sickness
        br
        v-btn(@click="goToOverviewPage" color="primary") Overview
        br
        
        br
        v-btn(@click="signOut" color="error") Sign Out
  </template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/useAuth";
import ChildInfo from "~/components/ChildInfo.vue";

const auth = useAuthStore();
const router = useRouter();

async function signOut() {
  try {
    await auth.signOutUser();
    router.push("/");
  } catch (error) {
    console.error("Error during sign out:", error);
  }
}

function goToBowelMovementPage() {
  router.push("/bowelmovement");
}
function goToSleepPage() {
  router.push("/sleep");
}
function goToFeedingPage() {
  router.push("/feeding");
}
function goToSicknessPage() {
  router.push("/sickness");
}
function goToOverviewPage() {
  router.push("/overview");
}
</script>
