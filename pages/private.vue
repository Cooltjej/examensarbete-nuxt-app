<template>
  <div>
    <h1>Welcome!</h1>
    <div>You are signed in with:</div>
    <div>Email: {{ auth.user.email }}</div>
    <div>Uid: {{ auth.user.uid }}</div>
    <br />

    <!-- Barninformation -->
    <div v-if="hasChild">
      <h2>Your Child's Details</h2>
      <p>Name: {{ childDetails.name }}</p>
      <p>Age: {{ childDetails.age }}</p>
      <p>Weight: {{ childDetails.weight }}</p>
      <p>Height: {{ childDetails.height }}</p>
      <br>
      <button @click="openBowelMovementPopup">Add Bowel Movement</button>
      <br>
      <!-- Lista för senaste tillägg -->
      <h3>Latest Addition</h3>
      <ul>
        <li v-for="movement in latestMovements" :key="movement.timestamp">
          {{ movement.movementType }} - {{ movement.timestamp }}
        </li>
      </ul>
    </div>

    <!-- Popup för Bowel Movement -->
    <v-dialog v-model="showPopup" persistent max-width="400">
      <template v-slot:default>
        <v-card>
          <v-card-title>Select Bowel Movement</v-card-title>
          <v-card-text>
            <v-btn @click="addBowelMovement('small movement')" class="mb-2">Small Movement</v-btn>
            <v-btn @click="addBowelMovement('large movement')" class="mb-2">Large Movement</v-btn>
            <v-btn @click="addBowelMovement('diarrhea')" class="mb-2">Diarrhea</v-btn>
            <v-btn @click="addBowelMovement('no movement')">No Movement</v-btn>
          </v-card-text>
        </v-card>
      </template>
    </v-dialog>

    <!-- Snackbar för meddelande -->
    <v-snackbar v-model="snackbar.visible" :timeout="snackbar.timeout" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <br />
    <button @click="signOut">Sign Out</button>
  </div>
</template>

<script setup>

definePageMeta({
  middleware: ['auth'],
});

const auth = useAuthStore();
const childStore = useChildStore();
const router = useRouter();

const hasChild = ref(false);
const showPopup = ref(false);
const latestMovements = ref([]); // För senaste tillägg
const childDetails = reactive({});
const snackbar = reactive({
  visible: false,
  message: '',
  color: '',
  timeout: 3000,
});

function openBowelMovementPopup() {
  showPopup.value = true;
}

async function addBowelMovement(type) {
  try {
    await childStore.addBowelMovement(childDetails.id, type);
    snackbar.message = 'Added successfully!';
    snackbar.color = 'success';
    showPopup.value = false;
  } catch (error) {
    console.error('Error adding bowel movement:', error);
    snackbar.message = 'Error adding movement.';
    snackbar.color = 'error';
  } finally {
    snackbar.visible = true;
  }
}

async function signOut() {
  try {
    await auth.signOutUser();
    router.push('/');
  } catch (error) {
    console.error('Error during sign out:', error);
  }
}

async function checkForChild() {
  try {
    const children = await childStore.fetchChildren(auth.user.uid);
    if (children.length > 0) {
      Object.assign(childDetails, children[0]); // Assuming one child per user
      hasChild.value = true;

      // Start listening for bowel movements
      childStore.listenToBowelMovements(childDetails.id, (movements) => {
        latestMovements.value = movements;
      });
    }
  } catch (error) {
    console.error('Error fetching child:', error);
  }
}

onMounted(async () => {
  if (!auth.user) {
    console.error('User not authenticated.');
    return;
  }
  await checkForChild();
});
</script>