<template lang="pug">
  v-dialog(v-model="localShow" persistent max-width="400")
    v-card
      v-card-title Breastfeeding
      v-card-text
        h3 Which breast?
        v-radio-group(v-model="feeding.breast")
          v-radio(label="Left" value="left")
          v-radio(label="Right" value="right")
          v-radio(label="Both" value="both")

        // Använd TimeSelector för tidshantering (samma som i BottleFeeding)
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
import { ref, watch } from "vue";
import { useChildStore } from "~/stores/useChildStore";
import TimeSelector from "./TimeSelector.vue";
import SnackbarMessage from "./SnackbarMessage.vue";

const props = defineProps({
childId: { type: String, required: true },
show: { type: Boolean, default: false },
});

const emits = defineEmits(["closed", "refresh"]);

const feeding = defineModel('feeding', { 
  default: {
    breast: "left",
    fromTime: "12:00",
    toTime: "12:00",
    timingChoice: "currentTime",
    timeOfDay: "morning",
    babyBurp: false
  }
});

const childStore = useChildStore();
const localShow = ref(props.show);

watch(localShow, (val) => {
  if (!val) {
    emits("closed");
  }
});

const snackbarShow = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

function showSnackbar(msg, color = "success") {
  snackbarMessage.value = msg;
  snackbarColor.value = color;
  snackbarShow.value = true;
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
  if (!feeding.value.breast) {
    showSnackbar("Please select which breast.", "error");
    return;
  }
  if (!feeding.value.breast) {
    showSnackbar("Please select which breast.", "error");
    return;
  }

  let feedingTimestamp = new Date();

  const feedingData = {
    breast: feeding.value.breast,
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
    feedingData.fromTime = null;
    feedingData.toTime = null;
    feedingData.timeOfDay = null;
  }

  feedingData.timestamp = feedingTimestamp.toISOString();

  try {
    if (feeding.value.id) {
      // Uppdatera befintlig feeding
      await childStore.updateBreastfeeding(props.childId, feeding.value.id, feedingData);
    } else {
      // Lägg till ny feeding
      await childStore.addBreastfeeding(props.childId, feedingData);
    }
    emits("refresh");
    closeDialog();
  } catch (error) {
    console.error("Error saving breastfeeding:", error);
    showSnackbar("Error saving feeding.", "error");
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
