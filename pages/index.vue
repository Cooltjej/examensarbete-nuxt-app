<template lang="pug">
  section
    v-container
      v-row
        v-col(cols="12")
          v-card
            v-card-title 
              | Sign in to your account

            v-card-text
              // Alert Section
              v-alert(
                v-if="show_alert"
                :type="alert_type"
                dismissible
              ) {{ alert_msg }}
              
              // Login Form
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
                v-btn(type="submit" color="green") Sign In

              // Forgot Password Section
              v-row(class="mt-2")
                v-col(cols="12")
                  v-btn(text color="orange-darken-4" @click="forgotPassword") Forgot Password?

            // Bottom actions (Sign Up link + Info button)
            v-card-actions
              p.mr-auto
                | Don't have an account yet?
                br
                NuxtLink(to="/register") Sign up

              // Info button in bottom right with icon
              v-btn(
                icon
                color="primary"
                @click="showInfoDialog = true"
              )
                v-icon mdi-information

    // Popup (Dialog) for the about/info section
    v-dialog(
      v-model="showInfoDialog"
      max-width="600"
    )
      v-card
        // Title with close button
        v-card-title
          v-spacer
          v-btn(icon @click="closeInfoDialog")
            v-icon mdi-close

        // Info Content
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
import { reactive, ref } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useRouter } from "vue-router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const form = reactive({
  email: "",
  password: "",
});

const show_alert = ref(false);
const alert_msg = ref("Please wait! We are logging you in.");
const alert_type = ref("info"); // Controls the type of the alert
const showInfoDialog = ref(false); // Controls visibility of info popup

const auth = useAuthStore();
const router = useRouter();

async function login() {
  show_alert.value = true;
  alert_msg.value = "Please wait! We are logging you in.";
  alert_type.value = "info";

  try {
    await auth.signInUser(form);
    alert_msg.value = "Success! You are now logged in.";
    alert_type.value = "success";
    router.push({ path: "/private" });
  } catch (error) {
    alert_msg.value = "Invalid login details.";
    alert_type.value = "error";
  }
}

async function forgotPassword() {
  if (!form.email) {
    show_alert.value = true;
    alert_msg.value = "Please enter your email address first.";
    alert_type.value = "error";
    return;
  }

  const authInstance = getAuth();
  try {
    await sendPasswordResetEmail(authInstance, form.email);
    show_alert.value = true;
    alert_msg.value = "A password reset link has been sent to your email.";
    alert_type.value = "success";
  } catch (error) {
    console.error("Error sending password reset email:", error);
    show_alert.value = true;
    alert_msg.value =
      "Failed to send password reset email. Please check if your email is correct.";
    alert_type.value = "error";
  }
}

// Info popup controls
function closeInfoDialog() {
  showInfoDialog.value = false;
}

function goToRegister() {
  showInfoDialog.value = false;
  router.push({ path: "/register" });
}
</script>

<style scoped>
/* You can adjust spacing or styles here as needed */
</style>
