<!-- pages/feeding.vue -->
<template lang="pug">
  v-container
    h2.h2 Feeding Log

    div(v-if="childId")
      h3.h3.mb-3 Add New Feeding Record
      v-btn(
        v-for="type in feedingTypes"
        :key="type"
        @click="openFeeding(type)"
        color="green lighten-1"
        rounded="xl"
        class="ma-2"
      )
        | {{ formatFeedingType(type) }}

      h3.h3.mt-6 Latest Feedings

      div(v-if="Object.keys(groupedFeedings).length > 0")
        v-card(v-for="(group, date) in groupedFeedings" :key="date" class="mb-4")
          v-card-title {{ formatDate(date) }}
          v-card-text
            v-list
              v-list-item(v-for="feeding in group" :key="feeding.id")
                v-list-item-title
                  span.text-decoration-underline {{ formatFeedingType(feeding.type) }}:
                  br
                  template(v-if="feeding.type === 'bottle'")
                    | Volume: {{ feeding.volume }}ml
                    br
                    | Increment Volume: {{ feeding.incrementVolume }}ml
                    br
                    | Did baby burp: {{ feeding.babyBurp ? 'Yes' : 'No' }}
                    br
                    | Time: {{ formatTime(feeding) }}
                  
                  template(v-else-if="feeding.type === 'breastfeeding'")
                    | Breast: {{ feeding.breast }}
                    br
                    | Did baby burp: {{ feeding.babyBurp ? 'Yes' : 'No' }}
                    br
                    | Time: {{ formatTime(feeding) }}
                  
                  template(v-else-if="feeding.type === 'solidfeeding'")
                    | Solid Type: {{ feeding.solidType }}
                    br
                    | Amount: {{ feeding.amount }}
                    br
                    | Time: {{ formatTime(feeding) }}
                
                  v-list-item-subtitle {{ formatTime(feeding) }}
                
                template(#append)
                  v-btn.mb-3(icon @click="editFeeding(feeding)" color="blue-lighten-1" small aria-labe="Edit Feeding")
                    v-icon mdi-pencil
                  v-btn.mb-3(icon @click="deleteFeeding(feeding)" color="red darken-1" small aria-label="Delete Feeding")
                    v-icon mdi-delete

      div(v-else)
          p No feeding records found.

      // Feeding Dialog Components
      BottleFeeding(
        v-if="showBottleFeeding"
        :child-id="childId"
        :show="showBottleFeeding"
        v-model:feeding="editFeedingData"
        @closed="closeBottleFeeding"
        @refresh="handleRefresh($event)"
      )

      BreastFeeding(
        v-if="showBreastFeeding"
        :child-id="childId"
        :show="showBreastFeeding"
        v-model:feeding="editFeedingData"
        @closed="closeBreastFeeding"
        @refresh="handleRefresh($event)"
      )

      SolidFeeding(
        v-if="showSolidFeeding"
        :child-id="childId"
        :show="showSolidFeeding"
        v-model:feeding="editFeedingData"
        @closed="closeSolidFeeding"
        @refresh="handleRefresh($event)"
      )

      SnackbarMessage(
        :message="snackbarMessage"
        :color="snackbarColor"
        :show="snackbarShow"
        @update:show="snackbarShow = $event"
      )
    
    div(v-else) Loading or no child found...
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useChildStore } from "~/stores/useChildStore";
import BottleFeeding from "~/components/BottleFeeding.vue";
import BreastFeeding from "~/components/BreastFeeding.vue";
import SolidFeeding from "~/components/SolidFeeding.vue";
import SnackbarMessage from "~/components/SnackbarMessage.vue";

const auth = useAuthStore();
const childStore = useChildStore();

const childId = ref(null);
const allFeedings = ref([]);

const showBottleFeeding = ref(false);
const showBreastFeeding = ref(false);
const showSolidFeeding = ref(false);
const editFeedingData = ref(null);

const snackbarShow = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

onMounted(async () => {
  if (!auth.user) {
    console.error("User not authenticated.");
    return;
  }
  const children = await childStore.fetchChildren(auth.user.uid);
  if (children.length > 0) {
    childId.value = children[0].id;
    childStore.listenToAllLoggings(childId.value, {
      bottleFeedings: (feedings) => {
        updateFeedings("bottle", feedings);
      },
      breastfeedings: (feedings) => {
        updateFeedings("breastfeeding", feedings);
      },
      solidfeedings: (feedings) => {
        updateFeedings("solidfeeding", feedings);
      },
    });
  } else {
    console.error("No child found.");
  }
});
function updateFeedings(type, feedings) {
  const updatedFeedings = feedings.map((f) => ({ ...f, type }));
  allFeedings.value = [
    ...allFeedings.value.filter((f) => f.type !== type),
    ...updatedFeedings,
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 15);
}

const feedingTypes = ["bottle", "breastfeeding", "solidfeeding"];

const groupedFeedings = computed(() => {
  const groups = {};
  allFeedings.value.forEach((feeding) => {
    if (!feeding.timestamp) {
      console.warn("Missing timestamp for feeding:", feeding);
      return;
    }
    const date = new Date(feeding.timestamp).toISOString().split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(feeding);
  });
  console.log("Grouped Feedings:", groups);
  return groups;
});

function formatFeedingType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function openFeeding(type) {
  editFeedingData.value = {
    type: type,
    timestamp: new Date().toISOString(),
    // Initialize other fields based on type
    ...(type === "bottle" && {
      volume: null,
      incrementVolume: null,
      babyBurp: false,
    }),
    ...(type === "breastfeeding" && { breast: "left", babyBurp: false }),
    ...(type === "solidfeeding" && { solidType: "", amount: "" }),
  };

  if (type === "bottle") {
    showBottleFeeding.value = true;
  } else if (type === "breastfeeding") {
    showBreastFeeding.value = true;
  } else if (type === "solidfeeding") {
    showSolidFeeding.value = true;
  }
}

function closeBottleFeeding() {
  showBottleFeeding.value = false;
  editFeedingData.value = null;
}

function closeBreastFeeding() {
  showBreastFeeding.value = false;
  editFeedingData.value = null;
}

function closeSolidFeeding() {
  showSolidFeeding.value = false;
  editFeedingData.value = null;
}

function editFeeding(feeding) {
  editFeedingData.value = { ...feeding };
  if (feeding.type === "bottle") {
    showBottleFeeding.value = true;
  } else if (feeding.type === "breastfeeding") {
    showBreastFeeding.value = true;
  } else if (feeding.type === "solidfeeding") {
    showSolidFeeding.value = true;
  }
}

async function deleteFeeding(feeding) {
  if (!childId.value) return;
  try {
    await childStore.deleteFeeding(childId.value, feeding.id);
    showSnackbar("Feeding deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting feeding:", error);
    showSnackbar("Error deleting feeding.", "error");
  }
}

function handleRefresh(eventData) {
  if (eventData && eventData.message) {
    showSnackbar(eventData.message, eventData.color || "success");
  } else {
    showSnackbar("Data updated successfully!", "success");
  }
}

function showSnackbar(msg, color = "success") {
  snackbarMessage.value = msg;
  snackbarColor.value = color;
  snackbarShow.value = true;
}

function formatDate(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Invalid Date";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}-${year}`;
}

function formatTime(feeding) {
  const date = new Date(feeding.timestamp);
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
/* Add any custom styles here */
.ma-2 {
  margin: 0.5rem;
}
</style>
