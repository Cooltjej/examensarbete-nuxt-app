<template>
  
    <div>
        <h1>
            Sign in to your account
        </h1>
        <div v-if="show_alert"  :class="alert_variant">
            {{ alert_msg }}
        </div>
        <form @submit.prevent="login">
            <div>
                <label for="email" >
                    Your email</label>
                <input type="email" name="email" id="email" v-model="form.email"
                    placeholder="name@company.com" required>
            </div>
            <div>
                <label for="password" class="block mb-2 text-sm font-medium">Password</label>
                <input type="password" name="password" id="password" placeholder="••••••••"
                    v-model="form.password"
                    required>
            </div>
            <button type="submit">
                Sign In</button>
            <p>
                Don't have an account yet?
                <NuxtLink to="/register" >Sign up</NuxtLink>
            </p>
        </form>
</div>
          
</template>

<script setup>
const form = reactive({
  email: '',
  password: '',
})

const show_alert = ref(false)
const alert_variant = ref('bg-blue-500')
const alert_msg = ref('Please wait! We are logging you in')

const auth = useAuthStore()
const router = useRouter()


async function login() {
  show_alert.value = true
  alert_variant.value = 'bg-blue-500'
  alert_msg.value = 'Please wait! We are logging you in.'

  try {
      await auth.signInUser(form)
  } catch (error) {
      show_alert.value = true
      alert_variant.value = 'bg-red-500'
      alert_msg.value = 'Invalid login details.'
      return
  }
  alert_variant.value = 'bg-green-500'
  alert_msg.value = 'Success! You are now logged in.'
  router.push({ path: "/private" })
}

</script>