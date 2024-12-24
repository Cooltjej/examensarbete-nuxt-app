<template lang="pug">
  v-container
    v-row
      v-col(cols="12")
        h2.h2 Sleep
  
        v-btn(@click="openSleepPopup" color="primary" rounded="xl") Add Sleep
  
        h3.h3.mt-6 Latest Sleep Logs
  
        div(v-if="Object.keys(groupedSleepLogs).length > 0")
          v-card(v-for="(group, date) in groupedSleepLogs" :key="date" class="mb-4")
            v-card-title {{ formatDate(date) }}
            v-card-text
              v-list
                v-list-item(v-for="log in group" :key="log.id")
                  v-list-item-title
                    span.text-decoration-underline Sleep:
                    br
                    | From: {{ formatTime(log.fromTime) }}
                    br
                    | To: {{ formatTime(log.toTime) }}
                  
                  template(#append)
                    v-btn.mb-3(icon @click="editSleepLog(log)" color="blue-lighten-1" small aria-label="Edit Sleep Log")
                      v-icon mdi-pencil
                    v-btn.mb-3(icon @click="deleteSleepLog(log.id)" color="red darken-1" small aria-label="Delete Sleep Log")
                      v-icon mdi-delete
  
        // Popup for selecting FROM/TO time
        v-dialog(v-model="showPopup" persistent max-width="400")
          v-card
            v-card-title Select Sleep Times
            v-card-text
              h3.h3 FROM
              v-time-picker(v-model="fromTime" format="24hr" view="hours")
  
              h3.h3 TO
              v-time-picker(v-model="toTime" format="24hr" view="hours")
  
            v-card-actions
              v-btn(@click="saveSleepLog" color="primary" rounded="xl") Save
              v-btn(@click="cancelPopup" color="secondary" rounded="xl") Cancel
  
        v-snackbar(v-model="snackbar.visible" :timeout="snackbar.timeout" :color="snackbar.color")
          | {{ snackbar.message }}
  </template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useChildStore } from "~/stores/useChildStore";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const db = getFirestore();
const auth = useAuthStore();
const childStore = useChildStore();

const childDetails = ref(null);
const sleepLogs = ref([]);
const showPopup = ref(false);
const selectedLogId = ref(null);

// Initiera FROM/TO som "HH:MM"
const fromTime = ref("12:00");
const toTime = ref("12:00");

const snackbar = reactive({
  visible: false,
  message: "",
  color: "success",
  timeout: 3000,
});

const groupedSleepLogs = computed(() => {
  const groups = {};
  sleepLogs.value.forEach((log) => {
    if (!log.timestamp) {
      console.warn("Missing timestamp for sleep log:", log);
      return;
    }
    const date = new Date(log.timestamp).toISOString().split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
  });
  console.log("Grouped Sleep Logs:", groups);
  return groups;
});

function openSleepPopup() {
  resetForm();
  showPopup.value = true;
}

function cancelPopup() {
  selectedLogId.value = null;
  showPopup.value = false;
}
function formatTime(time) {
  return time; // Assuming time is already in "HH:MM" format
}
async function saveSleepLog() {
  if (!childDetails.value?.id) {
    console.error("No childId found.");
    return;
  }

  try {
    if (selectedLogId.value) {
      await childStore.updateSleepLog(
        childDetails.value.id,
        selectedLogId.value,
        fromTime.value,
        toTime.value
      );
      console.log("Updated sleep log in Firestore");
      snackbar.message = "Sleep log updated successfully!";
    } else {
      await childStore.addSleepLog(
        childDetails.value.id,
        fromTime.value,
        toTime.value
      );
      console.log("Added new sleep log in Firestore");
      snackbar.message = "Sleep log added successfully!";
    }
    snackbar.color = "success";
    snackbar.visible = true;
    showPopup.value = false;
  } catch (error) {
    console.error("Error saving sleep log:", error);
    snackbar.message = "Error saving sleep log.";
    snackbar.color = "error";
    snackbar.visible = true;
  }
}

async function deleteSleepLog(logId) {
  if (!childDetails.value?.id) return;
  try {
    await childStore.deleteSleepLog(childDetails.value.id, logId);
    snackbar.message = "Sleep log deleted successfully!";
    snackbar.color = "success";
    snackbar.visible = true;
  } catch (error) {
    console.error("Error deleting sleep log:", error);
    snackbar.message = "Error deleting sleep log.";
    snackbar.color = "error";
    snackbar.visible = true;
  }
}

function editSleepLog(log) {
  // log.fromTime och log.toTime är "HH:MM"
  fromTime.value = log.fromTime;
  toTime.value = log.toTime;

  selectedLogId.value = log.id;
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
    childStore.listenToSleepLogs(childDetails.value.id, (logs) => {
      sleepLogs.value = logs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 15);
    });
  } else {
    console.error("No child found.");
  }
});

function formatDate(timestamp) {
  const date = new Date(timestamp);
  // "DD/MM-YY"
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}-${year}`;
}

function resetForm() {
  fromTime.value = "12:00";
  toTime.value = "12:00";
  selectedLogId.value = null;
}
</script>
