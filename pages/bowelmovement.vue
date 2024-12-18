<template lang="pug">
  v-container
    h2 Bowel Movements
    div(v-if="childId")
      // Lista över bowel movements
      v-list
        v-list-item(v-for="movement in bowelMovements" :key="movement.id")
          v-list-item-title {{ movement.formattedTimestamp }}: {{ movement.movementType }} ({{ movement.timeOfDay }})
          template(#append)
            v-btn(icon @click="editBowelMovement(movement)")
              v-icon mdi-pencil
            v-btn(icon color="error" @click="deleteBowelMovement(movement.id)")
              v-icon mdi-delete
  
      v-btn(@click="openBowelMovementPopup" color="primary") Add Bowel Movement
  
      // Popup för Bowel Movement
      v-dialog(v-model="showPopup", persistent, max-width="400")
        v-card
          v-card-title Select Bowel Movement
          v-card-text
            // MovementType knappar
            v-btn.mb-2(@click="selectMovementType('small movement')" color="primary") Small Movement
            v-btn.mb-2(@click="selectMovementType('large movement')" color="primary") Large Movement
            v-btn(@click="selectMovementType('no movement')" color="primary") No Movement
  
            h3 Time of Day
            // Använd v-radio direkt istället för :items
            v-radio-group(v-model="timeOfDay" class="mt-4")
              v-radio(v-for="item in timeOfDayItems" :key="item.value" :value="item.value" :label="item.title")
  
          v-card-actions
            v-btn(@click="saveBowelMovement" color="primary") Save
            v-btn(@click="cancelPopup" color="secondary") Cancel
  
      v-snackbar(v-model="snackbar.visible", :timeout="snackbar.timeout", :color="snackbar.color")
        | {{ snackbar.message }}
    div(v-else)
      | Loading or no child found...
  </template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useChildStore } from "~/stores/useChildStore";

const auth = useAuthStore();
const childStore = useChildStore();

const childId = ref(null);
const bowelMovements = ref([]);
const showPopup = ref(false);
const selectedMovementId = ref(null);

const snackbar = reactive({
  visible: false,
  message: "",
  color: "success",
  timeout: 3000,
});

const timeOfDay = ref("morning"); // default
const timeOfDayItems = [
  { title: "Morning", value: "morning" },
  { title: "Noon", value: "noon" },
  { title: "Afternoon", value: "afternoon" },
  { title: "Evening", value: "evening" },
  { title: "Nighttime", value: "nighttime" },
];

const movementType = ref(null);

function openBowelMovementPopup() {
  resetForm();
  showPopup.value = true;
}

function selectMovementType(type) {
  movementType.value = type;
}

function cancelPopup() {
  selectedMovementId.value = null;
  showPopup.value = false;
}

async function saveBowelMovement() {
  if (!childId.value) {
    console.error("No childId provided.");
    return;
  }

  if (!movementType.value) {
    snackbar.message = "Please select a movement type.";
    snackbar.color = "error";
    snackbar.visible = true;
    return;
  }

  try {
    if (selectedMovementId.value) {
      await childStore.updateBowelMovementWithTime(
        childId.value,
        selectedMovementId.value,
        movementType.value,
        timeOfDay.value
      );
      snackbar.message = "Bowel movement updated successfully!";
    } else {
      await childStore.addBowelMovementWithTime(
        childId.value,
        movementType.value,
        timeOfDay.value
      );
      snackbar.message = "Bowel movement added successfully!";
    }
    snackbar.color = "success";
    snackbar.visible = true;
    showPopup.value = false;
  } catch (error) {
    console.error("Error saving bowel movement:", error);
    snackbar.message = "Error saving bowel movement.";
    snackbar.color = "error";
    snackbar.visible = true;
  }
}

async function deleteBowelMovement(movementId) {
  if (!childId.value) return;
  try {
    await childStore.deleteBowelMovement(childId.value, movementId);
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
  movementType.value = movement.movementType;
  timeOfDay.value = movement.timeOfDay;
  showPopup.value = true;
}

onMounted(async () => {
  if (!auth.user) {
    console.error("User not authenticated.");
    return;
  }

  const children = await childStore.fetchChildren(auth.user.uid);
  if (children.length > 0) {
    childId.value = children[0].id;

    childStore.listenToBowelMovements(childId.value, (movements) => {
      bowelMovements.value = movements.map((movement) => ({
        ...movement,
        formattedTimestamp: formatTimestamp(movement.timestamp),
      }));
    });
  } else {
    console.error("No child found.");
  }
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

function resetForm() {
  movementType.value = null;
  timeOfDay.value = "morning";
  selectedMovementId.value = null;
}
</script>
