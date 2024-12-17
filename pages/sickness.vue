<template lang="pug">
  v-container
    h2 Sickness Log
    div(v-if="childId")
      h3 Add New Sickness Record
      v-btn(@click="openSickness('fever')" color="primary" class="ma-2") Fever
      v-btn(@click="openSickness('common_cold')" color="primary" class="ma-2") Common Cold
      v-btn(@click="openSickness('ear_infection')" color="primary" class="ma-2") Ear Infection
      v-btn(@click="openSickness('influenza')" color="primary" class="ma-2") Influenza
      v-btn(@click="openSickness('vomiting')" color="primary" class="ma-2") Vomiting
      v-btn(@click="openSickness('teething')" color="primary" class="ma-2") Teething
      v-btn(@click="openSickness('other')" color="primary" class="ma-2") Other

      h3 Latest Sickness Logs
      v-list
        v-list-item(v-for="item in allSicknesses" :key="item.id")
          v-list-item-content
            v-list-item-title
              | {{ formatDate(item.timestamp) }}
              br
              template(v-if="item.sicknessType === 'fever'")
                | Fever: Temp: {{ item.temperature }}°C
                br
                | Notes: {{ item.notes }}
                br
                template(v-if="item.hadMedicine")
                  | Medicine Given Time: {{ item.medicineTime }}
                br

              template(v-else-if="item.sicknessType === 'common_cold'")
                | Common Cold:
                template(v-if="item.hasFever")
                  | Temp: {{ item.temperature }}°C,
                | Runny Nose: {{ item.runnyNose ? 'Yes' : 'No' }}
                br
                | Notes: {{ item.notes }}
                br

              template(v-else-if="item.sicknessType === 'ear_infection'")
                | Ear Infection:
                template(v-if="item.hasFever")
                  | Temp: {{ item.temperature }}°C,
                | Ear: {{ item.ear }}
                br
                | Notes: {{ item.notes }}
                br

              template(v-else-if="item.sicknessType === 'influenza'")
                | Influenza: Temp: {{ item.temperature }}°C, Vomiting: {{ item.vomiting ? 'Yes' : 'No' }}, Diarrhea: {{ item.diarrhea ? 'Yes' : 'No' }}
                br
                | Notes: {{ item.notes }}
                br

              template(v-else-if="item.sicknessType === 'vomiting'")
                | Vomiting: Temp: {{ item.temperature }}°C
                br
                | Notes: {{ item.notes }}
                br

              template(v-else-if="item.sicknessType === 'teething'")
                | Teething:
                template(v-if="item.hasFever")
                  | Temp: {{ item.temperature }}°C,
                | Stomachache: {{ item.stomachache ? 'Yes' : 'No' }}, Fussy Sleep: {{ item.fussySleep ? 'Yes' : 'No' }}, Gassy: {{ item.gassy ? 'Yes' : 'No' }}
                br
                | Notes: {{ item.notes }}
                br

              template(v-else-if="item.sicknessType === 'other'")
                | Other Sickness
                br
                | Notes: {{ item.notes }}
                br

              | {{ formatFeedingTime(item) }}

          v-list-item-action
            v-btn(icon @click="editSickness(item)" color="primary")
              v-icon mdi-pencil
            v-btn(icon color="error" @click="deleteSicknessItem(item)")
              v-icon mdi-delete

      sickness-dialog(
        v-if="showSicknessDialog"
        :child-id="childId"
        :show="showSicknessDialog"
        v-model:sickness="editSicknessData"
        @closed="closeSicknessDialog"
        @refresh="handleRefresh($event)"
      )

    div(v-else)
      | Loading or no child found...

    // Snackbar for messages
    snackbar-message(
      :message="snackbarMessage"
      :color="snackbarColor"
      :show="snackbarShow"
      @update:show="snackbarShow = $event"
    )
</template>

<script setup>
import { ref, onMounted } from "vue";
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

// Snackbar states
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
    });
  } else {
    console.error("No child found.");
  }
});

function openSickness(sType) {
  editSicknessData.value = {
    sicknessType: sType,
    notes: "",
    fromTime: "12:00",
    toTime: "12:00",
    timingChoice: "currentTime",
    timeOfDay: "morning",
    // Initialize optional fields based on type
    ...(sType === "common_cold" && { runnyNose: false, hasFever: "false" }),
    ...(sType === "ear_infection" && { ear: "both", hasFever: "false" }),
    ...(sType === "influenza" && { vomiting: false, diarrhea: false }),
    ...(sType === "vomiting" && {}),
    ...(sType === "teething" && {
      stomachache: false,
      fussySleep: false,
      gassy: false,
      hasFever: "false",
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

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}-${year}`;
}

function formatFeedingTime(feeding) {
  if (
    feeding.type === "bottle" ||
    feeding.type === "breastfeeding" ||
    feeding.type === "solidfeeding" ||
    feeding.type === "sickness"
  ) {
    if (feeding.timingChoice === "currentTime") {
      return new Date(feeding.timestamp).toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (feeding.timingChoice === "specificTime") {
      const d = formatDate(feeding.timestamp);
      return `${d} ${feeding.fromTime} - ${feeding.toTime}`;
    } else if (feeding.timingChoice === "timeOfDay") {
      const d = formatDate(feeding.timestamp);
      return `${d} ${feeding.timeOfDay}`;
    }
    return formatDate(feeding.timestamp);
  }
  return "";
}
</script>
