<template lang="pug">
  v-container
    v-row
      v-col(cols="12")
        h2.h2 Bowel Movements
  
        v-btn(@click="openBowelMovementPopup" color="orange" rounded="xl") Add Bowel Movement
  
        h3.h3.mt-6 Latest Bowel Movements
  
        div(v-if="Object.keys(groupedBowelMovements).length > 0")
          v-card(v-for="(group, date) in groupedBowelMovements" :key="date" class="mb-4")
            v-card-title {{ formatDate(date) }}
            v-card-text
              v-list
                v-list-item(v-for="movement in group" :key="movement.id")
                  v-list-item-title
                    span.text-decoration-underline {{capitalizeFirstLetter(movement.movementType) }}
                    br
                    | Time of Day: {{ movement.timeOfDay }}
                    br
                    | Time: {{ formatTime(movement.timestamp) }}
                  
                  template(#append)
                    v-btn.mb-3(icon @click="editBowelMovement(movement)" color="blue-lighten-1" small aria-label="Edit Bowel Movement")
                      v-icon mdi-pencil
                    v-btn.mb-3(icon @click="deleteBowelMovement(movement.id)" color="red darken-1" small aria-label="Delete Bowel Movement")
                      v-icon mdi-delete
  
        // Popup for Bowel Movement
        v-dialog(v-model="showPopup" persistent max-width="400")
          v-card
            v-card-title Select Bowel Movement
            v-card-text
              // Dynamic Movement Type Buttons
              v-row.mb-4.justify-center
                v-btn(
                  v-for="category in movementCategories"
                  :key="category.name"
                  :color="movementType === category.name ? category.color : 'grey lighten-2'"
                  rounded="xl"
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
              v-btn(@click="saveBowelMovement" color="primary" rounded="xl") Save
              v-btn(@click="cancelPopup" color="secondary" rounded="xl") Cancel
  
        v-snackbar(v-model="snackbar.visible" :timeout="snackbar.timeout" :color="snackbar.color")
          | {{ snackbar.message }}
  </template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useChildStore } from "~/stores/useChildStore";

const auth = useAuthStore();
const childStore = useChildStore();

const childDetails = ref(null);
const bowelMovements = ref([]);
const showPopup = ref(false);
const selectedMovementId = ref(null);

const snackbar = reactive({
  visible: false,
  message: "",
  color: "success",
  timeout: 3000,
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const timeOfDay = ref("morning");
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

const groupedBowelMovements = computed(() => {
  const groups = {};
  bowelMovements.value.forEach((movement) => {
    if (!movement.timestamp) {
      console.warn("Missing timestamp for bowel movement:", movement);
      return;
    }
    const date = new Date(movement.timestamp).toISOString().split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(movement);
  });
  return groups;
});

function openBowelMovementPopup() {
  resetForm();
  movementType.value = "small movement";
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
  if (!childDetails.value?.id) {
    console.error("No childId found.");
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
        childDetails.value.id,
        selectedMovementId.value,
        movementType.value,
        timeOfDay.value
      );
      snackbar.message = "Bowel movement updated successfully!";
    } else {
      await childStore.addBowelMovementWithTime(
        childDetails.value.id,
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
  if (!childDetails.value?.id) return;
  try {
    await childStore.deleteBowelMovement(childDetails.value.id, movementId);
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
    childDetails.value = children[0];
    childStore.listenToBowelMovements(childDetails.value.id, (movements) => {
      bowelMovements.value = movements.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    });
  } else {
    console.error("No child found.");
  }
});

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resetForm() {
  movementType.value = "small movement";
  timeOfDay.value = "morning";
  selectedMovementId.value = null;
}
</script>
