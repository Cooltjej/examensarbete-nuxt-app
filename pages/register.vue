<template>
  <section>
      <div>
        <h1>
            Create account
        </h1>
        <div v-if="show_alert" 
            :class="alert_variant">
            {{ alert_msg }}
        </div>
        <form  @submit.prevent="register">
            <div>
                <label for="name" >
                    Your name</label>
                <input type="text" name="name" id="name" v-model="form.name"
                    placeholder="John Smith" required>
            </div>
            <div>
                <label for="email" >
                    Your email</label>
                <input type="email" name="email" id="email" v-model="form.email"
                    placeholder="name@company.com" required>
            </div>
            <div>
                <label for="password" >Password</label>
                <input type="password" name="password" id="password" placeholder="••••••••"
                    v-model="form.password"
                    required>
            </div>
            <button type="submit">
                Create an account</button>
            <p>
                Already have an account?
                <NuxtLink to="/" >Login here</NuxtLink>
            </p>
        </form>
    </div>
         
  </section>
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