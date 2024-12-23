<template>
  <div>
    <h3>Set Time</h3>
    <v-radio-group v-model="timingChoice">
      <v-radio label="Add specific time" value="specificTime" />
      <v-radio label="Set time of day" value="timeOfDay" />
      <v-radio label="Use current time" value="currentTime" />
    </v-radio-group>

    <template v-if="timingChoice === 'specificTime'">
      <h4>Started</h4>
      <v-time-picker
        v-model="fromTime"
        format="24hr"
        view="hours"
        @update:hour="startHourSelect"
      />
      <span>{{ fromTime }}</span>
      <h4>Finished</h4>
      <v-time-picker
        v-model="toTime"
        format="24hr"
        view="hours"
        @update:hour="endHourSelect"
      />
    </template>

    <template v-else-if="timingChoice === 'timeOfDay'">
      <v-radio-group v-model="timeOfDay">
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

const timeOfDayItems = [
  { title: "Morning", value: "morning" },
  { title: "Noon", value: "noon" },
  { title: "Afternoon", value: "afternoon" },
  { title: "Evening", value: "evening" },
  { title: "Nighttime", value: "nighttime" },
];

const timingChoice = defineModel("timingChoice", { required: false });
const fromTime = defineModel("fromTime", { required: false });
const toTime = defineModel("toTime", { required: false });
const timeOfDay = defineModel("timeOfDay", { required: false });

function startHourSelect(e) {
  const old_time = fromTime.value;
  fromTime.value = e + ":" + old_time.split(":")[1];
}

function endHourSelect(e) {
  const old_time = toTime.value;
  toTime.value = e + ":" + old_time.split(":")[1];
}
</script>
