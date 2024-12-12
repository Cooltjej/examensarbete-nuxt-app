<template lang="pug">
    v-dialog(v-model="localShow" persistent max-width="400")
      v-card
        v-card-title Breastfeeding
        v-card-text
          h3 Which breast?
          v-radio-group(v-model="breastChoice")
            v-radio(label="Left" value="left")
            v-radio(label="Right" value="right")
            v-radio(label="Both" value="both")
    
          p Started
          v-time-picker(v-model="fromTimeVal" format="24hr" view="hours")
          p Finished
          v-time-picker(v-model="toTimeVal" format="24hr" view="hours")
    
          h3 Did your baby burp?
          v-radio-group(v-model="babyBurpBreast")
            v-radio(label="Yes" value="yes")
            v-radio(label="No" value="no")
    
        v-card-actions
          v-btn(@click="saveFeeding" color="primary") Save
          v-btn(@click="cancel" color="secondary") Cancel

    snackbar-message(
      :message="snackbarMessage"
      :color="snackbarColor"
      :show="snackbarShow"
      @update:show="snackbarShow = $event"
    )
</template>

<script setup>
import { ref, watch } from "vue";
import { useChildStore } from "~/stores/useChildStore";
import SnackbarMessage from "./SnackbarMessage.vue"; // antar att den ligger i samma mapp

const props = defineProps({
  childId: { type: String, required: true },
  show: { type: Boolean, default: false },
  feeding: { type: Object, default: null }, // Om vi redigerar befintlig feeding
});

const emits = defineEmits(["closed", "refresh"]);

const childStore = useChildStore();

const localShow = ref(props.show);

watch(
  () => props.show,
  (val) => {
    localShow.value = val;
    if (val && props.feeding) {
      loadFeeding(props.feeding);
    } else if (val && !props.feeding) {
      resetForm();
    }
  }
);

watch(localShow, (val) => {
  if (!val) {
    emits("closed");
  }
});
// Snackbar-states
const snackbarShow = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

// Funktion för att visa snackbar
function showSnackbar(msg, color = "success") {
  snackbarMessage.value = msg;
  snackbarColor.value = color;
  snackbarShow.value = true;
}

const breastChoice = ref("left");
const fromTimeVal = ref("12:00");
const toTimeVal = ref("12:00");
const babyBurpBreast = ref("no");

function resetForm() {
  breastChoice.value = "left";
  fromTimeVal.value = "12:00";
  toTimeVal.value = "12:00";
  babyBurpBreast.value = "no";
}

function loadFeeding(f) {
  breastChoice.value = f.breast || "left";
  fromTimeVal.value = f.fromTime || "12:00";
  toTimeVal.value = f.toTime || "12:00";
  babyBurpBreast.value = f.babyBurp ? "yes" : "no";
}

function closeDialog() {
  localShow.value = false;
}

async function saveFeeding() {
  if (!props.childId) {
    console.error("No childId");
    return;
  }

  if (!breastChoice.value || !fromTimeVal.value || !toTimeVal.value) {
    console.error("Please select breast and times.");
    return;
  }

  const feedingData = {
    breast: breastChoice.value,
    fromTime: fromTimeVal.value,
    toTime: toTimeVal.value,
    babyBurp: babyBurpBreast.value === "yes",
  };

  // Konstruera en timestamp för sorting baserat på fromTimeVal
  const fromDate = parseTimeToDate(fromTimeVal.value);
  feedingData.timestamp = fromDate.toISOString();

  try {
    if (props.feeding && props.feeding.id) {
      // Uppdatera befintlig feeding
      await childStore.updateBreastfeeding(
        props.childId,
        props.feeding.id,
        feedingData
      );
    } else {
      // Ny feeding
      await childStore.addBreastfeeding(props.childId, feedingData);
    }
    emits("refresh");
    closeDialog();
  } catch (error) {
    console.error("Error saving breastfeeding:", error);
  }
}

function cancel() {
  closeDialog();
}

function parseTimeToDate(timeStr) {
  const now = new Date();
  const [H, M] = timeStr.split(":");
  now.setHours(parseInt(H, 10));
  now.setMinutes(parseInt(M, 10));
  return now;
}
</script>
