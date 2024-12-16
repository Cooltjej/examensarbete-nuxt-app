<template lang="pug">
  v-dialog(v-model="localShow" persistent max-width="400")
    v-card
      v-card-title Solid Feeding
      v-card-text
        h3 Select portion type
        v-select(
          v-model="feeding.solidType"
          :items="solidTypeItems"
          item-title="text"
          item-value="value"
          label="Solid Type"
          outlined
        )

        // Jar Options
        template(v-if="feeding.solidType === 'jar'")
          h3 How much did your baby eat?
          v-radio-group(v-model="feeding.jarChoice")
            v-radio(label="Half a jar" value="half")
            v-radio(label="Full jar" value="full")
            v-radio(label="Tea Spoon" value="teaspoon")
            v-radio(label="Own input" value="own")

          template(v-if="feeding.jarChoice === 'teaspoon'")
            v-select(
              v-model="feeding.teaspoonAmount"
              :items="teaspoonItems"
              label="How many?"
              outlined
            )

          template(v-if="feeding.jarChoice === 'own'")
            v-text-field(
              v-model="feeding.ownAmount"
              label="Amount eaten"
              outlined
            )

        // Squeeze Options
        template(v-else-if="feeding.solidType === 'squeeze'")
          h3 How much did your baby eat?
          v-radio-group(v-model="feeding.squeezeChoice")
            v-radio(label="Half a squeeze bag" value="half")
            v-radio(label="Full squeeze bag" value="full")
            v-radio(label="Several squeeze bags" value="several")
            v-radio(label="Own input" value="own")

          template(v-if="feeding.squeezeChoice === 'several'")
            v-select(
              v-model="feeding.squeezeAmount"
              :items="squeezeItems"
              label="How many?"
              outlined
            )

          template(v-if="feeding.squeezeChoice === 'own'")
            v-text-field(
              v-model="feeding.ownAmount"
              label="Amount eaten"
              outlined
            )

        // Tasting Options
        template(v-else-if="feeding.solidType === 'tasting'")
          h3 How much did your baby taste?
          v-radio-group(v-model="feeding.tastingChoice")
            v-radio(label="Tea Spoons" value="teaspoon")
            v-radio(label="Own input" value="own")

          template(v-if="feeding.tastingChoice === 'teaspoon'")
            v-select(
              v-model="feeding.teaspoonAmount"
              :items="teaspoonItems"
              label="How many?"
              outlined
            )

          template(v-if="feeding.tastingChoice === 'own'")
            v-text-field(
              v-model="feeding.ownAmount"
              label="Amount eaten"
              outlined
            )

        // TimeSelector
        time-selector(
          v-model:timingChoice="feeding.timingChoice"
          v-model:fromTime="feeding.fromTime"
          v-model:toTime="feeding.toTime"
          v-model:timeOfDay="feeding.timeOfDay"
        )

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

const emits = defineEmits(["closed","refresh"]);

const feeding = defineModel('feeding', {
  default: {
    solidType: null,
    jarChoice: null,
    squeezeChoice: null,
    tastingChoice: null,
    teaspoonAmount: null,
    squeezeAmount: null,
    ownAmount: null,
    fromTime: "12:00",
    toTime: "12:00",
    timingChoice: "currentTime",
    timeOfDay: "morning",
  }
});

const localShow = ref(props.show);
watch(() => props.show, val => {
  localShow.value = val;
});

watch(localShow, val => {
  if (!val) emits("closed");
});

const childStore = useChildStore();

const snackbarShow = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");
function showSnackbar(msg, color = "success") {
  snackbarMessage.value = msg;
  snackbarColor.value = color;
  snackbarShow.value = true;
}

const solidTypeItems = [
  { text: "Jar (190g)", value: "jar" },
  { text: "Squeeze bag (120g)", value: "squeeze" },
  { text: "Tasting portion", value: "tasting" }
];

const teaspoonItems = Array.from({ length: 10 }, (_, i) => i + 1);
const squeezeItems = Array.from({ length: 5 }, (_, i) => i + 1);

function closeDialog() {
  localShow.value = false;
}

function parseTimeToDate(timeStr) {
  const now = new Date();
  const [H, M] = timeStr.split(":");
  now.setHours(parseInt(H, 10));
  now.setMinutes(parseInt(M, 10));
  return now;
}

function buildFeedingData() {
  const data = {
    solidType: feeding.value.solidType,
    timingChoice: feeding.value.timingChoice,
    timestamp: new Date().toISOString()
  };

  if (feeding.value.timingChoice === "specificTime") {
    const startDate = parseTimeToDate(feeding.value.fromTime);
    data.fromTime = feeding.value.fromTime;
    data.toTime = feeding.value.toTime;
    data.timestamp = startDate.toISOString();
    data.timeOfDay = null;
  } else if (feeding.value.timingChoice === "timeOfDay") {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    data.timestamp = now.toISOString();
    data.timeOfDay = feeding.value.timeOfDay;
    data.fromTime = null;
    data.toTime = null;
  } else if (feeding.value.timingChoice === "currentTime") {
    data.fromTime = null;
    data.toTime = null;
    data.timeOfDay = null;
  }

  if (data.solidType === "jar") {
    data.jarChoice = feeding.value.jarChoice;
    if (feeding.value.jarChoice === "teaspoon") {
      if (!feeding.value.teaspoonAmount) {
        showSnackbar("Please select number of teaspoons.", "error");
        return null;
      }
      data.amount = feeding.value.teaspoonAmount + " teaspoon(s)";
    } else if (feeding.value.jarChoice === "own") {
      if (!feeding.value.ownAmount) {
        showSnackbar("Please input amount eaten.", "error");
        return null;
      }
      data.amount = feeding.value.ownAmount;
    } else if (feeding.value.jarChoice === "half") {
      data.amount = "Half a jar";
    } else if (feeding.value.jarChoice === "full") {
      data.amount = "Full jar";
    } else {
      showSnackbar("Please select how much from jar.", "error");
      return null;
    }
  } else if (data.solidType === "squeeze") {
    data.squeezeChoice = feeding.value.squeezeChoice;
    if (feeding.value.squeezeChoice === "several") {
      if (!feeding.value.squeezeAmount) {
        showSnackbar("Please select number of squeeze bags.", "error");
        return null;
      }
      data.amount = feeding.value.squeezeAmount + " squeeze bag(s)";
    } else if (feeding.value.squeezeChoice === "own") {
      if (!feeding.value.ownAmount) {
        showSnackbar("Please input amount eaten.", "error");
        return null;
      }
      data.amount = feeding.value.ownAmount;
    } else if (feeding.value.squeezeChoice === "half") {
      data.amount = "Half a squeeze bag";
    } else if (feeding.value.squeezeChoice === "full") {
      data.amount = "Full squeeze bag";
    } else {
      showSnackbar("Please select how much from squeeze bag.", "error");
      return null;
    }
  } else if (data.solidType === "tasting") {
    data.tastingChoice = feeding.value.tastingChoice;
    if (feeding.value.tastingChoice === "teaspoon") {
      if (!feeding.value.teaspoonAmount) {
        showSnackbar("Please select number of teaspoons.", "error");
        return null;
      }
      data.amount = feeding.value.teaspoonAmount + " teaspoon(s)";
    } else if (feeding.value.tastingChoice === "own") {
      if (!feeding.value.ownAmount) {
        showSnackbar("Please input amount eaten.", "error");
        return null;
      }
      data.amount = feeding.value.ownAmount;
    } else {
      showSnackbar("Please select how much tasted.", "error");
      return null;
    }
  } else {
    showSnackbar("Please select a solid type.", "error");
    return null;
  }

  return data;
}

async function saveFeeding() {
  if (!props.childId) {
    console.error("No childId");
    return;
  }

  const feedingObj = buildFeedingData();
  if (!feedingObj) {
    // validation failed
    return;
  }

  try {
    if (feeding.value.id) {
      await childStore.updateSolidfeeding(props.childId, feeding.value.id, feedingObj);
      showSnackbar("Solid feeding updated!", "success");
    } else {
      await childStore.addSolidfeeding(props.childId, feedingObj);
      showSnackbar("Solid feeding saved!", "success");
    }
    emits("refresh", {message: "Solid feeding saved!"});
    closeDialog();
  } catch (error) {
    console.error("Error saving feeding:", error);
    showSnackbar("Error saving feeding.", "error");
  }
}

function cancel() {
  closeDialog();
}
</script>
