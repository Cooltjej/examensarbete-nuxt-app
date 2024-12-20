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
  </template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/useAuth";
import ChildInfo from "~/components/ChildInfo.vue";

const auth = useAuthStore();
const router = useRouter();

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
