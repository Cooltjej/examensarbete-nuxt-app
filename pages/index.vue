<template lang="pug">
  section
    v-container
      v-row
        v-col(cols="12")
          v-card
            v-card-title 
              | Sign in to your account

            v-card-text
              v-alert(
                v-if="show_alert"
                type="error"
                dismissible
              ) {{ alert_msg }}
              
              v-form(@submit.prevent="login")
                v-text-field(
                  label="Your email"
                  v-model="form.email"
                  placeholder="name@company.com"
                  type="email"
                  required
                )
                v-text-field(
                  label="Password"
                  v-model="form.password"
                  placeholder="••••••••"
                  type="password"
                  required
                )
                v-btn(type="submit" color="primary") Sign In

              // Forgot Password Section
              v-row(class="mt-2")
                v-col(cols="12")
                  v-btn(text color="secondary" @click="forgotPassword") Forgot Password?

            // Bottom actions (Sign Up link + Info button)
            v-card-actions
              p.mr-auto
                | Don't have an account yet?
                br
                NuxtLink(to="/register") Sign up

              // Info button in bottom right
              v-btn(
                icon
                color="primary"
                @click="showInfoDialog = true"
              )
                // Using literal 'i' or an icon like v-icon
                | i

  // Popup (Dialog) for the about/info section
  v-dialog(
    v-model="showInfoDialog"
    max-width="600"
  )
    v-card
      // Title (can be empty or have a heading)
      v-card-title
        v-spacer
        // X close button in top-right
        v-btn(icon @click="closeInfoDialog")
          v-icon mdi-close

      v-card-text
        p.mb-4
          | This app helps you keep track of your baby's feedings, 
          | bowel movements, sickness logs, and sleep patterns. 
          | It provides an easy way to manage and overview 
          | your child's day-to-day well-being.

      // Sign up prompt at the bottom-right corner
      v-card-actions
        v-spacer
        v-btn(color="primary" @click="goToRegister") Sign up
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '~/stores/useAuth';
import { useRouter } from 'vue-router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const form = reactive({
  email: '',
  password: '',
});

const show_alert = ref(false);
const alert_msg = ref('Please wait! We are logging you in');
const showInfoDialog = ref(false); // Controls visibility of info popup

const auth = useAuthStore();
const router = useRouter();

async function login() {
  show_alert.value = true;
  alert_msg.value = 'Please wait! We are logging you in.';

  try {
    await auth.signInUser(form);
  } catch (error) {
    show_alert.value = true;
    alert_msg.value = 'Invalid login details.';
    return;
  }
  alert_msg.value = 'Success! You are now logged in.';
  router.push({ path: '/private' });
}

async function forgotPassword() {
  if (!form.email) {
    show_alert.value = true;
    alert_msg.value = 'Please enter your email address first.';
    return;
  }

  const authInstance = getAuth();
  try {
    await sendPasswordResetEmail(authInstance, form.email);
    show_alert.value = true;
    alert_msg.value = 'A password reset link has been sent to your email.';
  } catch (error) {
    console.error('Error sending password reset email:', error);
    show_alert.value = true;
    alert_msg.value = 'Failed to send password reset email. Please check if your email is correct.';
  }
}

// Info popup controls
function closeInfoDialog() {
  showInfoDialog.value = false;
}

function goToRegister() {
  showInfoDialog.value = false;
  router.push({ path: '/register' });
}
</script>

<style scoped>
/* You can adjust spacing or styles here as needed */
</style>
