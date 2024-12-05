<template lang="pug">
section
  v-container
    v-row
      v-col(cols="12")
        v-card
          v-card-title Sign in to your account
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
          v-card-actions
            p
              | Don't have an account yet?
              NuxtLink(to="/register") Sign up
          
</template>

<script setup>
const form = reactive({
  email: '',
  password: '',
})

const show_alert = ref(false)
const alert_msg = ref('Please wait! We are logging you in')

const auth = useAuthStore()
const router = useRouter()


async function login() {
  show_alert.value = true
  alert_msg.value = 'Please wait! We are logging you in.'

  try {
      await auth.signInUser(form)
  } catch (error) {
      show_alert.value = true
      alert_msg.value = 'Invalid login details.'
      return
  }
  alert_msg.value = 'Success! You are now logged in.'
  router.push({ path: "/private" })
}

</script>