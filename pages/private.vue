<template lang="pug">
  v-container
    v-row
      v-col(cols="12")
        h1 Welcome!
        div You are signed in with:
        div Email: {{ auth.user.email }}
        div Uid: {{ auth.user.uid }}
        br
        // Här visar vi bara ChildInfo nu
        child-info
  
        br
        v-btn(@click="signOut" color="error") Sign Out
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '~/stores/useAuth';
  import ChildInfo from '~/components/ChildInfo.vue';
  
  const auth = useAuthStore();
  const router = useRouter();
  
  async function signOut() {
    try {
      await auth.signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }
  </script>
  