<template lang="pug">
  v-container
    v-row
      v-col(cols="12")
        h1 Welcome!
        div You are signed in with:
        div Email: {{ auth.user.email }}
        div Uid: {{ auth.user.uid }}
        br
        // Kontrollera om barnet finns
        div(v-if="!hasChild && !showForm")
          p Do you have a child registered?
          v-btn(@click="handleHasChild(true)" color="primary") Yes
          v-btn(@click="handleHasChild(false)" color="primary") No
        // Formulär för att registrera ett barn
        div(v-else-if="showForm")
          h2 Register Your Child
          v-form(@submit.prevent="saveChild")
            v-text-field(v-model="child.name" label="Child's Name" required outlined)
            v-text-field(v-model="child.age" label="Age" type="number" required outlined)
            v-text-field(v-model="child.weight" label="Weight (kg)" type="number" required outlined)
            v-text-field(v-model="child.height" label="Height (cm)" type="number" required outlined)
            v-btn(type="submit" color="primary") Save
          p {{ message }}
        // Visa barnets detaljer
        div(v-else)
          h2 Your Child's Details
          p Name: {{ childDetails.name }}
          p Age: {{ childDetails.age }}
          p Weight: {{ childDetails.weight }}
          p Height: {{ childDetails.height }}
          br
          v-btn(@click="openBowelMovementPopup" color="primary") Add Bowel Movement
        br
        v-btn(@click="signOut" color="error") Sign Out
  
    // Snackbar för meddelande
    v-snackbar(v-model="snackbar.visible", :timeout="snackbar.timeout", :color="snackbar.color")
      | {{ snackbar.message }}
  
    // Popup för Bowel Movement
    v-dialog(v-model="showPopup", persistent, max-width="400")
      v-card
        v-card-title Select Bowel Movement
        v-card-text
          v-btn.mb-2(@click="addBowelMovement('small movement')" color="primary") Small Movement
          v-btn.mb-2(@click="addBowelMovement('large movement')" color="primary") Large Movement
          v-btn.mb-2(@click="addBowelMovement('diarrhea')" color="primary") Diarrhea
          v-btn(@click="addBowelMovement('no movement')" color="primary") No Movement
        v-card-actions
          v-btn(@click="cancelPopup" color="secondary") Cancel

    v-list
      v-list-item(v-for="movement in bowelMovements" :key="movement.id")
        v-list-item-title {{ movement.formattedTimestamp }}: {{ movement.movementType }}
        v-list-item-actions
          v-btn(icon @click="editBowelMovement(movement)") <v-icon>mdi-pencil</v-icon>
          v-btn(icon color="error" @click="deleteBowelMovement(movement.id)") <v-icon>mdi-delete</v-icon>
  </template>
  
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router'; // Importera useRouter
  import { useAuthStore } from '~/stores/useAuth';
  import { useChildStore } from '~/stores/useChildStore';
  import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

  const db = getFirestore();
  const auth = useAuthStore();
  const childStore = useChildStore();
  const router = useRouter(); // Initiera router
  const selectedMovementId = ref(null);

  
  const hasChild = ref(false);
  const showForm = ref(false);
  const child = reactive({
    name: '',
    age: '',
    weight: '',
    height: '',
  });
  const childDetails = reactive({});
  const message = ref('');
  const snackbar = reactive({
    visible: false,
    message: '',
    color: 'success',
    timeout: 3000,
  });
  const showPopup = ref(false);
  
  function handleHasChild(response) {
    showForm.value = !response;
    if (response) {
      checkForChild();
    }
  }
  
  async function checkForChild() {
  try {
    const children = await childStore.fetchChildren(auth.user.uid);
    if (children.length > 0) {
      Object.assign(childDetails, children[0]); // Inkluderar id
      hasChild.value = true;
      showForm.value = false;
    } else {
      showForm.value = true;
    }
  } catch (error) {
    console.error('Error fetching child:', error);
  }
}
  
  function openBowelMovementPopup() {
  console.log("Opening bowel movement popup"); // Debug-logg
  showPopup.value = true; // Visa popupen
}

function cancelPopup() {
  selectedMovementId.value = null; // Återställ redigeringsläget
  showPopup.value = false; // Stäng popupen
}
async function addBowelMovement(movementType) {
  try {
    if (selectedMovementId.value) {
      // Uppdatera befintlig logg
      await childStore.updateBowelMovement(childDetails.id, selectedMovementId.value, movementType);
      selectedMovementId.value = null; // Återställ redigeringsläget
    } else {
      // Lägg till ny logg
      await childStore.addBowelMovement(childDetails.id, movementType);
    }
    snackbar.message = `${movementType} ${selectedMovementId.value ? 'updated' : 'added'} successfully!`;
    snackbar.color = 'success';
    snackbar.visible = true;
    showPopup.value = false;
  } catch (error) {
    console.error('Error adding/updating bowel movement:', error);
    snackbar.message = 'Error adding or updating bowel movement.';
    snackbar.color = 'error';
    snackbar.visible = true;
  }
}
function listenToBowelMovements(childId, callback) {
  const bowelMovementsRef = collection(doc(db, 'children', childId), 'bowelMovements');
  onSnapshot(bowelMovementsRef, (snapshot) => {
    const movements = snapshot.docs.map((doc) => ({
      id: doc.id, // Lägger till dokument-ID för redigering och radering
      ...doc.data(),
    }));
    callback(movements);
  });
}
async function deleteBowelMovement(movementId) {
  try {
    const movementRef = doc(db, 'children', childDetails.id, 'bowelMovements', movementId);
    await deleteDoc(movementRef);
    snackbar.message = 'Movement deleted successfully!';
    snackbar.color = 'success';
    snackbar.visible = true;
  } catch (error) {
    console.error('Error deleting movement:', error);
    snackbar.message = 'Error deleting movement.';
    snackbar.color = 'error';
    snackbar.visible = true;
  }
}

function editBowelMovement(movement) {
  selectedMovementId.value = movement.id; // Sätt loggens ID
  openBowelMovementPopup(); // Visa popupen
}

  async function saveChild() {
    try {
      await childStore.addChild(auth.user.uid, child);
      message.value = 'Child saved successfully!';
      Object.assign(childDetails, child);
      showForm.value = false;
      hasChild.value = true;
      snackbar.message = 'Child saved successfully!';
      snackbar.color = 'success';
      snackbar.visible = true;
    } catch (error) {
      console.error('Error saving child:', error);
      message.value = 'Error saving child. Please try again.';
      snackbar.message = 'Error saving child.';
      snackbar.color = 'error';
      snackbar.visible = true;
    }
  }
  
  async function signOut() {
    try {
      await auth.signOutUser();
      router.push('/'); // Redirect to login page
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }
  
  const bowelMovements = ref([]);

  onMounted(async () => {
  if (!auth.user) {
    console.error('User not authenticated.');
    return;
  }

  await checkForChild();

  // Callback-funktion för att uppdatera bowelMovements
  const updateMovements = (movements) => {
    bowelMovements.value = movements.map((movement) => ({
      ...movement,
      formattedTimestamp: formatTimestamp(movement.timestamp), // Formaterar tiden
    }));
  };

  // Lyssna på förändringar i bowelMovements
  childStore.listenToBowelMovements(childDetails.id, updateMovements);
});


function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
  </script>
  