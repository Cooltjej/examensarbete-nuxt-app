<template>
  <div>
    <h3>Set Feeding Time</h3>
    <v-radio-group v-model="localTimingChoice" @change="emitTimingChoice">
      <v-radio label="Add specific time" value="specificTime" />
      <v-radio label="Set time of day" value="timeOfDay" />
      <v-radio label="Use current time" value="currentTime" />
    </v-radio-group>

    <template v-if="localTimingChoice === 'specificTime'">
      <h4>Started</h4>
      <v-time-picker
        v-model="localFromTime"
        format="24hr"
        view="hours"
        @change="emitFromTime"
      />
      <h4>Finished</h4>
      <v-time-picker
        v-model="localToTime"
        format="24hr"
        view="hours"
        @change="emitToTime"
      />
    </template>

    <template v-else-if="localTimingChoice === 'timeOfDay'">
      <v-radio-group v-model="localTimeOfDay" @change="emitTimeOfDay">
        <v-radio
          v-for="item in timeOfDayItems"
          :key="item.value"
          :value="item.value"
          :label="item.title"
        />
      </v-radio-group>
    </template>
    <!-- currentTime: inget extra att visa -->
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  timingChoice: { type: String, default: "currentTime" },
  fromTimeVal: { type: String, default: "12:00" },
  toTimeVal: { type: String, default: "12:00" },
  timeOfDay: { type: String, default: "morning" },
  timeOfDayItems: {
    type: Array,
    default: () => [
      { title: "Morning", value: "morning" },
      { title: "Noon", value: "noon" },
      { title: "Afternoon", value: "afternoon" },
      { title: "Evening", value: "evening" },
      { title: "Nighttime", value: "nighttime" },
    ],
  },
});

const emits = defineEmits([
  "update:timingChoice",
  "update:fromTimeVal",
  "update:toTimeVal",
  "update:timeOfDay",
]);

const localTimingChoice = ref(props.timingChoice);
const localFromTime = ref(props.fromTimeVal);
const localToTime = ref(props.toTimeVal);
const localTimeOfDay = ref(props.timeOfDay);

function emitTimingChoice(value) {
  // när timingChoice ändras
  emits("update:timingChoice", localTimingChoice.value);
}

function emitFromTime(value) {
  emits("update:fromTimeVal", localFromTime.value);
}

function emitToTime(value) {
  emits("update:toTimeVal", localToTime.value);
}

function emitTimeOfDay(value) {
  emits("update:timeOfDay", localTimeOfDay.value);
}

// Uppdatera local variabler om props ändras (om du vill stödja det)
watch(
  () => props.timingChoice,
  (val) => (localTimingChoice.value = val)
);
watch(
  () => props.fromTimeVal,
  (val) => (localFromTime.value = val)
);
watch(
  () => props.toTimeVal,
  (val) => (localToTime.value = val)
);
watch(
  () => props.timeOfDay,
  (val) => (localTimeOfDay.value = val)
);
</script>
