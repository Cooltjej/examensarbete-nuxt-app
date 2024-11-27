<template>
  <section class="bg-gray-400">
      <div class="flex items-center justify-center h-screen">
          <div class="rounded-lg shadow-lg  w-full max-w-md bg-gray-800 border-gray-700">
              <div class="p-6 text-white">
                  <h1 class="text-xl font-bold  md:text-2xl py-2 mb-2">
                      Create account
                  </h1>
                  <div v-if="show_alert" class="text-white text-center font-bold p-4 mb-4"
                      :class="alert_variant">
                      {{ alert_msg }}
                  </div>
                  <form class="space-y-6" @submit.prevent="register">
                      <div>
                          <label for="name" class="block mb-2 text-sm font-medium">
                              Your name</label>
                          <input type="text" name="name" id="name" v-model="form.name"
                              class="border text-sm rounded-lg w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="John Smith" required>
                      </div>
                      <div>
                          <label for="email" class="block mb-2 text-sm font-medium">
                              Your email</label>
                          <input type="email" name="email" id="email" v-model="form.email"
                              class="border text-sm rounded-lg w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="name@company.com" required>
                      </div>
                      <div>
                          <label for="password" class="block mb-2 text-sm font-medium">Password</label>
                          <input type="password" name="password" id="password" placeholder="••••••••"
                              v-model="form.password"
                              class="border text-sm rounded-lg w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                              required>
                      </div>
                      <button type="submit"
                          class="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                          Create an account</button>
                      <p class="text-sm font-light text-gray-400">
                          Already have an account?
                          <NuxtLink to="/" class="font-medium hover:underline text-blue-500">Login here</NuxtLink>
                      </p>
                  </form>
              </div>
          </div>
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