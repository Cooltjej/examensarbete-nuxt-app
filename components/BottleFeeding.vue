<template lang="pug">
  v-dialog(v-model="localShow" persistent max-width="400")
    v-card
      v-card-title Bottle Feeding {{feeding.toTime}}
      v-card-text
        h3 Bottle Volume (ml)
        v-select(v-model="feeding.volume" :items="bottleVolumeItems" label="Volume" outlined)
  
        h3 Additional Volume (ml)
        v-select(v-model="feeding.incrementVolume" :items="incrementVolumeItems" label="Extra Volume" outlined)
  
        // Använd TimeSelector för tidshantering
        time-selector(
          v-model:timingChoice="feeding.timingChoice"
          v-model:fromTime="feeding.fromTime"
          v-model:toTime="feeding.toTime"
          v-model:timeOfDay="feeding.timeOfDay"
        )
  
        h3 
          v-checkbox(v-model="feeding.babyBurp" label="Did your baby burp?")
        
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
});

const emits = defineEmits(["closed", "refresh"]);

const feeding = defineModel('feeding',  { default:
{
  volume: null,
  incrementVolume: null,
  fromTime: "12:00",
  toTime: "12:00",
  timingChoice: "currentTime",
  timeOfDay: "morning",
  babyBurp: false
}
})

const childStore = useChildStore();
const localShow = ref(props.show);

// När dialog stängs
watch(localShow, (val) => {
if (!val) {
  emits("closed");
}
});
const snackbarShow = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

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

function closeDialog() {
localShow.value = false;
}

async function saveFeeding() {
if (!props.childId) {
  console.error("No childId");
  return;
}
if (feeding.value.volume == null || feeding.value.incrementVolume == null) {
  // visa felmeddelande
  return;
}

let feedingTimestamp = new Date();
// const burpBool = feeding.value.babyBurp === "yes";

const feedingData = {
  volume: feeding.value.volume,
  incrementVolume: feeding.value.incrementVolume,
  timingChoice: feeding.value.timingChoice,
  babyBurp: feeding.value.babyBurp,
};

if (feeding.value.timingChoice === "specificTime") {
  const startDate = parseTimeToDate(feeding.value.fromTime);
  const endDate = parseTimeToDate(feeding.value.toTime);
  feedingData.fromTime = feeding.value.fromTime;
  feedingData.toTime = feeding.value.toTime;
  feedingTimestamp = startDate;
} else if (feeding.value.timingChoice === "timeOfDay") {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  feedingTimestamp = now;
  feedingData.timeOfDay = feeding.value.timeOfDay;
  feedingData.fromTime = null;
  feedingData.toTime = null;
} else if (feeding.value.timingChoice === "currentTime") {
  // just current time
  feedingData.fromTime = null;
  feedingData.toTime = null;
  feedingData.timeOfDay = null;
}

feedingData.timestamp = feedingTimestamp.toISOString();

console.log(feedingData)
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
