<template lang="pug">
    v-dialog(v-model="localShow" persistent max-width="400")
      v-card
        v-card-title Bottle Feeding
        v-card-text
          h3 Bottle Volume (ml)
          v-select(v-model="bottleVolume" :items="bottleVolumeItems" label="Volume" outlined)
    
          h3 Additional Volume (ml)
          v-select(v-model="incrementVolume" :items="incrementVolumeItems" label="Extra Volume" outlined)
    
          // Använd TimeSelector för tidshantering
          time-selector(
            :timingChoice="timingChoice"
            :fromTimeVal="fromTimeVal"
            :toTimeVal="toTimeVal"
            :timeOfDay="timeOfDay"
            :timeOfDayItems="timeOfDayRadioItems"
            @update:timingChoice="val => timingChoice = val"
            @update:fromTimeVal="val => fromTimeVal = val"
            @update:toTimeVal="val => toTimeVal = val"
            @update:timeOfDay="val => timeOfDay = val"
          )
    
          h3 Did your baby burp?
          v-radio-group(v-model="babyBurp")
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
import { ref, computed, watch, onMounted } from "vue";
import { useChildStore } from "~/stores/useChildStore";
import TimeSelector from "./TimeSelector.vue";
import SnackbarMessage from "./SnackbarMessage.vue"; // antar att den ligger i samma mapp

const props = defineProps({
  childId: { type: String, required: true },
  show: { type: Boolean, default: false },
  feeding: { type: Object, default: null }, // Om feeding != null: vi redigerar befintlig feeding
});

const emits = defineEmits(["closed", "refresh"]);

// Använd childStore för att spara och uppdatera feedings
const childStore = useChildStore();

// Lokala states
const localShow = ref(props.show);

// När props.show ändras, uppdatera localShow
watch(
  () => props.show,
  (val) => {
    localShow.value = val;
    if (val && props.feeding) {
      // Om vi öppnar för redigering, ladda befintlig data
      loadFeeding(props.feeding);
    } else if (val && !props.feeding) {
      // Ny feeding
      resetForm();
    }
  }
);

// När dialog stängs
watch(localShow, (val) => {
  if (!val) {
    emits("closed");
  }
});
const snackbarShow = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

// Funktion för att visa snackbar
function showSnackbar(msg, color = "success") {
  snackbarMessage.value = msg;
  snackbarColor.value = color;
  snackbarShow.value = true;
}
// Data för bottle feeding
const bottleVolume = ref(null);
const incrementVolume = ref(null);
const timingChoice = ref("currentTime"); // 'specificTime', 'timeOfDay', 'currentTime'
const fromTimeVal = ref("12:00"); // Används om specificTime
const toTimeVal = ref("12:00"); // Används om specificTime, t.ex. Finished
const timeOfDay = ref("morning"); // Om timeOfDay valts
const babyBurp = ref("no");

const bottleVolumeItems = [0, 100, 200, 300, 400];
const incrementVolumeItems = [];
for (let i = 0; i <= 95; i += 5) {
  incrementVolumeItems.push(i);
}

const timeOfDayRadioItems = [
  { title: "Morning", value: "morning" },
  { title: "Noon", value: "noon" },
  { title: "Afternoon", value: "afternoon" },
  { title: "Evening", value: "evening" },
  { title: "Nighttime", value: "nighttime" },
];

function resetForm() {
  bottleVolume.value = null;
  incrementVolume.value = null;
  timingChoice.value = "currentTime";
  fromTimeVal.value = "12:00";
  toTimeVal.value = "12:00";
  timeOfDay.value = "morning";
  babyBurp.value = "no";
}

function loadFeeding(f) {
  // Ladda data från befintlig feeding
  bottleVolume.value = f.volume;
  incrementVolume.value = f.incrementVolume;
  timingChoice.value = f.timingChoice || "currentTime";
  fromTimeVal.value = f.fromTime || "12:00";
  toTimeVal.value = f.toTime || "12:00";
  timeOfDay.value = f.timeOfDay || "morning";
  babyBurp.value = f.babyBurp ? "yes" : "no";
}

function closeDialog() {
  localShow.value = false;
}

async function saveFeeding() {
  if (!props.childId) {
    console.error("No childId");
    return;
  }
  if (bottleVolume.value == null || incrementVolume.value == null) {
    // visa felmeddelande
    return;
  }

  let feedingTimestamp = new Date();
  const burpBool = babyBurp.value === "yes";

  const feedingData = {
    volume: bottleVolume.value,
    incrementVolume: incrementVolume.value,
    timingChoice: timingChoice.value,
    babyBurp: burpBool,
  };

  if (timingChoice.value === "specificTime") {
    const startDate = parseTimeToDate(fromTimeVal.value);
    const endDate = parseTimeToDate(toTimeVal.value);
    feedingData.fromTime = fromTimeVal.value;
    feedingData.toTime = toTimeVal.value;
    feedingTimestamp = startDate;
  } else if (timingChoice.value === "timeOfDay") {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    feedingTimestamp = now;
    feedingData.timeOfDay = timeOfDay.value;
    feedingData.fromTime = null;
    feedingData.toTime = null;
  } else if (timingChoice.value === "currentTime") {
    // just current time
    feedingData.fromTime = null;
    feedingData.toTime = null;
    feedingData.timeOfDay = null;
  }

  feedingData.timestamp = feedingTimestamp.toISOString();

  try {
    if (props.feeding && props.feeding.id) {
      // Uppdatera befintlig feeding
      await childStore.updateBottleFeeding(
        props.childId,
        props.feeding.id,
        feedingData
      );
    } else {
      // Lägg till ny feeding
      await childStore.addBottleFeeding(props.childId, feedingData);
    }
    emits("refresh");
    closeDialog();
  } catch (error) {
    console.error("Error saving feeding:", error);
    // visa felmeddelande
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
