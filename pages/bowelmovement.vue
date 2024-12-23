<template lang="pug">
  v-container
    h2.h2 Bowel Movements
    div(v-if="childId")
      v-btn.mb-3.mt-0(@click="openBowelMovementPopup" color="orange" rounded="xl") Add Bowel Movement
      // List of bowel movements
      
      v-list
        v-list-item(v-for="movement in bowelMovements" :key="movement.id")
          v-list-item-title
          span.font-weight-bold
            | {{ movement.formattedTimestamp }}: 
          br
          span.text-decoration-underline {{ movement.movementType }} 
          br
          | ({{ movement.timeOfDay }})
          template(#append)
            v-btn(icon @click="editBowelMovement(movement)")
              v-icon mdi-pencil
            v-btn(icon color="red-darken-2" @click="deleteBowelMovement(movement.id)")
              v-icon mdi-delete


      // Popup for Bowel Movement
      v-dialog(v-model="showPopup", persistent, max-width="400")
        v-card
          v-card-title Select Bowel Movement
          v-card-text
            // Dynamic Movement Type Buttons
            v-row.mb-4.justify-center
              v-btn(
                v-for="category in movementCategories"
                :key="category.name"
                :color="movementType === category.name ? category.color : 'grey lighten-2'" rounded="xl"
                :variant="movementType === category.name ? 'elevated' : 'text'"
                class="ma-2"
                @click="selectMovementType(category.name)"
              )
                | {{ category.displayName }}

            h3.h3 Time of Day
            // Radio buttons for time of day
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

const movementCategories = [
  { name: "small movement", displayName: "Small Movement", color: "orange" },
  { name: "large movement", displayName: "Large Movement", color: "orange" },
  { name: "no movement", displayName: "No Movement", color: "orange" },
];

function openBowelMovementPopup() {
  resetForm(); // Ensure the form is reset
  movementType.value = "small movement"; // Set default to "small movement"
  showPopup.value = true; // Open the popup
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
  // Do not overwrite if already set by the popup open logic
  if (!movementType.value) {
    movementType.value = "small movement";
  }
  timeOfDay.value = "morning"; // Reset timeOfDay to default
  selectedMovementId.value = null; // Reset selected movement ID
}
</script>
