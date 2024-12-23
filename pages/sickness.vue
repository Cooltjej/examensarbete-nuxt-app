<!-- pages/sickness.vue -->
<template lang="pug">
  v-container
    h2.h2 Sickness Log

    div(v-if="childId")
      h3.h3.mb-3 Add New Sickness Record
      v-btn(
        v-for="type in sicknessTypes"
        :key="type"
        @click="openSickness(type)"
        color="purple lighten-1"
        rounded="xl"
      )
        | {{ formatSicknessType(type) }}
      
      h3.h3.mt-6 Latest Sickness Logs
      
      div(v-if="Object.keys(groupedSicknesses).length > 0")
        v-card(v-for="(group, date) in groupedSicknesses" :key="date" class="mb-4")
          v-card-title {{ formatDate(date) }}
          v-card-text
            v-list
              v-list-item(v-for="item in group" :key="item.id")
                v-list-item-title
                  span {{ formatSicknessType(item.sicknessType) }}:
                    br
                    template(v-if="item.sicknessType === 'fever'")
                      | Temp: {{ item.temperature }}°C
                    template(v-else-if="item.sicknessType === 'common_cold'")
                      | Temp: {{ item.hasFever ? item.temperature + ' °C' : 'No temp' }},
                      br
                      | Runny Nose: {{ item.runnyNose ? 'Yes' : 'No' }}
                    template(v-else-if="item.sicknessType === 'ear_infection'")
                      | Temp: {{ item.hasFever ? item.temperature + ' °C' : 'No temp' }},
                      br
                      | Ear(s): {{ item.ear }}
                    template(v-else-if="item.sicknessType === 'influenza'")
                      | Temp: {{ item.temperature }}°C,
                      br
                      | Vomiting: {{ item.vomiting ? 'Yes' : 'No' }},
                      br
                      | Diarrhea: {{ item.diarrhea ? 'Yes' : 'No' }}
                    template(v-else-if="item.sicknessType === 'vomiting'")
                      | Temp: {{ item.temperature }}°C
                    template(v-else-if="item.sicknessType === 'teething'")
                      | Stomachache: {{ item.stomachache ? 'Yes' : 'No' }},
                      br
                      | Fussy Sleep: {{ item.fussySleep ? 'Yes' : 'No' }},
                      br
                      | Gassy: {{ item.gassy ? 'Yes' : 'No' }}
                    template(v-else-if="item.sicknessType === 'other'")
                      | Other Sickness
                    br
                    template(v-if="item.hadMedicine")
                      | Medicine Given at: {{ item.medicineTime }}
                    template(v-else)
                      | Medicine Given at: No medicine given
                    br
                    | Notes: {{ item.notes || 'No notes' }}
                  v-list-item-subtitle {{ formatTime(item) }}
                  
                template(#append)
                  v-btn.mb-3(icon @click="editSickness(item)" color="blue-lighten-1" small aria-label="Edit Sickness")
                    v-icon mdi-pencil
                  v-btn.mb-3(icon @click="deleteSicknessItem(item)" color="red-darken-1" small aria-label="Delete Sickness")
                    v-icon mdi-delete

      div(v-else)
        p No sickness records found.
    
      SicknessDialog(
        v-if="showSicknessDialog"
        :child-id="childId"
        :show="showSicknessDialog"
        v-model:sickness="editSicknessData"
        @closed="closeSicknessDialog"
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
import SicknessDialog from "~/components/SicknessDialog.vue";
import SnackbarMessage from "~/components/SnackbarMessage.vue";

const auth = useAuthStore();
const childStore = useChildStore();

const childId = ref(null);
const allSicknesses = ref([]);

const showSicknessDialog = ref(false);
const editSicknessData = ref(null);

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

    childStore.listenToSicknesses(childId.value, (sicknesses) => {
      const sicknessList = sicknesses.map((s) => ({ ...s, type: "sickness" }));
      sicknessList.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      allSicknesses.value = sicknessList.slice(0, 15);
      console.log("All Sicknesses:", allSicknesses.value);
    });
  } else {
    console.error("No child found.");
  }
});

const sicknessTypes = [
  "fever",
  "common_cold",
  "ear_infection",
  "influenza",
  "vomiting",
  "teething",
  "other",
];

const groupedSicknesses = computed(() => {
  const groups = {};
  allSicknesses.value.forEach((item) => {
    if (!item.timestamp) {
      console.warn("Missing timestamp for item:", item);
      return;
    }
    const date = new Date(item.timestamp).toISOString().split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });
  console.log("Grouped Sicknesses:", groups);
  return groups;
});

function formatSicknessType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function openSickness(sType) {
  editSicknessData.value = {
    sicknessType: sType,
    notes: "",
    fromTime: "12:00",
    toTime: "12:00",
    timingChoice: "currentTime",
    timeOfDay: "morning",
    ...(sType === "common_cold" && { runnyNose: false, hasFever: false }),
    ...(sType === "ear_infection" && { ear: "both", hasFever: false }),
    ...(sType === "influenza" && { vomiting: false, diarrhea: false }),
    ...(sType === "vomiting" && { hasFever: true }),
    ...(sType === "teething" && {
      stomachache: false,
      fussySleep: false,
      gassy: false,
      hasFever: false,
    }),
    ...(sType === "fever" && { hadMedicine: false, medicineTime: "12:00" }),
    ...(sType === "other" && {}),
  };
  showSicknessDialog.value = true;
}

function closeSicknessDialog() {
  showSicknessDialog.value = false;
  editSicknessData.value = null;
}

function editSickness(item) {
  editSicknessData.value = { ...item };
  showSicknessDialog.value = true;
}

async function deleteSicknessItem(item) {
  if (!childId.value) return;
  try {
    await childStore.deleteSickness(childId.value, item.id);
    showSnackbar("Sickness deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting sickness:", error);
    showSnackbar("Error deleting sickness.", "error");
  }
}

function handleRefresh(eventData) {
  if (eventData && eventData.message) {
    showSnackbar(eventData.message, "success");
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

function formatTime(entry) {
  if (
    entry.type === "bottle" ||
    entry.type === "breastfeeding" ||
    entry.type === "solidfeeding" ||
    entry.type === "sickness"
  ) {
    if (entry.timingChoice === "currentTime") {
      return new Date(entry.timestamp).toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (entry.timingChoice === "specificTime") {
      const d = formatDate(entry.timestamp);
      return `${d} ${entry.fromTime} - ${entry.toTime}`;
    } else if (entry.timingChoice === "timeOfDay") {
      const d = formatDate(entry.timestamp);
      return `${d} ${entry.timeOfDay}`;
    }
    return formatDate(entry.timestamp);
  }
  return "";
}
</script>

<style scoped>
.btn-active {
  font-weight: bold;
  border-bottom: 2px solid white;
}
.cursor-pointer {
  cursor: pointer;
  transition: color 0.3s;
}

.cursor-pointer:hover {
  color: lighten(#ffffff, 20%);
}

.mr-2 {
  margin-right: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}
</style>
