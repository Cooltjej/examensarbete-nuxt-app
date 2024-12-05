<template lang="pug">
  section
  v-container
    v-row
      v-col(cols="12")
        v-card
          v-card-title Create account
          v-card-text
            v-alert(
              v-if="show_alert"
              :type="alert_variant"
              dismissible
            ) {{ alert_msg }}
            
            v-form(@submit.prevent="register")
              v-text-field(
                label="Your name"
                v-model="form.name"
                placeholder="John Smith"
                required
              )
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
              v-btn(type="submit" color="primary") Create an account
            
          v-card-actions
            p Already have an account?
            NuxtLink(to="/") Login here

</template>

<script setup>
const form = reactive({
  name: '',
  email: '',
  password: '',
})

const show_alert = ref(false)
const alert_variant = ref('bg-blue-500')
const alert_msg = ref('Please wait! Your account is being created.')

const auth = useAuthStore()
const router = useRouter()

async function register() {
  show_alert.value = true
  alert_variant.value = 'bg-blue-500'
  alert_msg.value = 'Please wait! Your account is being created.'

  try {
      await auth.createUser(form)
  } catch (error) {
      show_alert.value = true
      alert_variant.value = 'bg-red-500'
      alert_msg.value = 'An unexpected error occurred. Please try again later.'
      return
  }
  alert_variant.value = 'bg-green-500'
  alert_msg.value = 'Success! Your account is created.'
  router.push({ path: "/private" })
}

</script>