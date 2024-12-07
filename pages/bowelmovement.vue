<template lang="pug">
    v-container
      v-row
        v-col(cols="12")
          h2 Bowel Movements
          // Lista över bowel movements (endast de fem senaste)
          v-btn(@click="openBowelMovementPopup" color="primary") Add Bowel Movement
          v-list
            v-list-item(v-for="movement in bowelMovements" :key="movement.id")
              v-list-item-title {{ movement.formattedTimestamp }}: {{ movement.movementType }}
              template(#append)
                v-btn(icon @click="editBowelMovement(movement)")
                  v-icon mdi-pencil
                v-btn(icon color="error" @click="deleteBowelMovement(movement.id)")
                  v-icon mdi-delete
    
    
          // Popup för bowel movement
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
    
          v-snackbar(v-model="snackbar.visible", :timeout="snackbar.timeout", :color="snackbar.color")
            | {{ snackbar.message }}
    </template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useChildStore } from "~/stores/useChildStore";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const db = getFirestore();
const auth = useAuthStore();
const childStore = useChildStore();

const bowelMovements = ref([]); // Vi använder bara bowelMovements
const showPopup = ref(false);
const selectedMovementId = ref(null);
const snackbar = reactive({
  visible: false,
  message: "",
  color: "success",
  timeout: 3000,
});

const childDetails = ref(null); // Här lagrar vi barnets info inklusive id

function openBowelMovementPopup() {
  showPopup.value = true;
}

function cancelPopup() {
  selectedMovementId.value = null;
  showPopup.value = false;
}

async function addBowelMovement(movementType) {
  try {
    if (!childDetails.value?.id) {
      console.error("No childId found.");
      return;
    }
    if (selectedMovementId.value) {
      await childStore.updateBowelMovement(
        childDetails.value.id,
        selectedMovementId.value,
        movementType
      );
      selectedMovementId.value = null;
    } else {
      await childStore.addBowelMovement(childDetails.value.id, movementType);
    }
    snackbar.message = `${movementType} ${
      selectedMovementId.value ? "updated" : "added"
    } successfully!`;
    snackbar.color = "success";
    snackbar.visible = true;
    showPopup.value = false;
  } catch (error) {
    console.error("Error adding/updating bowel movement:", error);
    snackbar.message = "Error adding or updating bowel movement.";
    snackbar.color = "error";
    snackbar.visible = true;
  }
}

async function deleteBowelMovement(movementId) {
  try {
    if (!childDetails.value?.id) {
      console.error("No childId found.");
      return;
    }
    const movementRef = doc(
      db,
      "children",
      childDetails.value.id,
      "bowelMovements",
      movementId
    );
    await deleteDoc(movementRef);
    snackbar.message = "Movement deleted successfully!";
    snackbar.color = "success";
    snackbar.visible = true;
  } catch (error) {
    console.error("Error deleting movement:", error);
    snackbar.message = "Error deleting movement.";
    snackbar.color = "error";
    snackbar.visible = true;
  }
}

function editBowelMovement(movement) {
  selectedMovementId.value = movement.id;
  openBowelMovementPopup();
}

onMounted(async () => {
  // Se till att användaren är inloggad
  if (!auth.user) {
    console.error("User not authenticated.");
    return;
  }

  // Hämta barnets data
  const children = await childStore.fetchChildren(auth.user.uid);
  if (children.length > 0) {
    childDetails.value = children[0];
  } else {
    console.error("No child found.");
    return;
  }

  const updateMovements = (movements) => {
    const sorted = movements.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    // Ta de fem senaste
    const recentFive = sorted.slice(0, 5);

    bowelMovements.value = recentFive.map((movement) => ({
      ...movement,
      formattedTimestamp: formatTimestamp(movement.timestamp),
    }));
  };

  childStore.listenToBowelMovements(childDetails.value.id, updateMovements);
});

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
