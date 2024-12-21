<!-- components/SicknessDialog.vue -->
<template lang="pug">
  v-dialog(v-model="localShow" persistent max-width="500")
    v-card
      v-card-title Sickness
      v-card-text
        // Conditional fields based on sickness type
        template(v-if="isConditionalFeverType")
          h3 Fever?
          v-radio-group(v-model="hasFever")
            v-radio(label="Has fever" value="true")
            v-radio(label="No fever" value="false")

          template(v-if="hasFever === 'true'")
            h3 Temperature
            v-row
              v-col(cols="6")
                v-select(
                  v-model="tempWhole"
                  :items="wholeTemps"
                  label="Whole number"
                  outlined
                )
              v-col(cols="6")
                v-select(
                  v-model="tempDecimal"
                  :items="decimalTemps"
                  label="Decimal"
                  outlined
                )

        template(v-else-if="isAlwaysTempType")
          h3 Temperature
          v-row
            v-col(cols="6")
              v-select(
                v-model="tempWhole"
                :items="wholeTemps"
                label="Whole number"
                outlined
              )
            v-col(cols="6")
              v-select(
                v-model="tempDecimal"
                :items="decimalTemps"
                label="Decimal"
                outlined
              )

        // Medicine option available for all sickness types
        h3
          v-checkbox(v-model="hadMedicine" label="Had medicine?")
        template(v-if="hadMedicine")
          h3 Medicine Given Time
          v-text-field(
            v-model="medicineTime"
            label="Medicine Time"
            type="time"
            outlined
          )

        // Additional fields based on sickness type
        template(v-if="sickness.sicknessType === 'common_cold'")
          h3
            v-checkbox(v-model="sickness.runnyNose" label="Runny Nose?")

        template(v-if="sickness.sicknessType === 'ear_infection'")
          h3 Which Ear?
          v-radio-group(v-model="sickness.ear")
            v-radio(label="Left" value="left")
            v-radio(label="Right" value="right")
            v-radio(label="Both" value="both")

        template(v-if="sickness.sicknessType === 'influenza'")
          h3
            v-checkbox(v-model="sickness.vomiting" label="Vomiting?")
          h3
            v-checkbox(v-model="sickness.diarrhea" label="Diarrhea?")

        template(v-if="sickness.sicknessType === 'teething'")
          h3
            v-checkbox(v-model="sickness.stomachache" label="Stomachache?")
          h3
            v-checkbox(v-model="sickness.fussySleep" label="Fussy Sleep?")
          h3
            v-checkbox(v-model="sickness.gassy" label="Gassy?")

        // Time handling
        time-selector(
          v-model:timingChoice="sickness.timingChoice"
          v-model:fromTime="sickness.fromTime"  
          v-model:toTime="sickness.toTime"
          v-model:timeOfDay="sickness.timeOfDay"
        )

        h3 Notes
        v-text-field(
          v-model="sickness.notes"
          label="Add notes"
          outlined
          textarea
          rows="3"
        )

      v-card-actions
        v-btn(@click="saveSickness" color="primary") Save
        v-btn(@click="cancel" color="secondary") Cancel

  // Snackbar for messages
  snackbar-message(
    :message="snackbarMessage"
    :color="snackbarColor"
    :show="snackbarShow"
    @update:show="snackbarShow = $event"
  )
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useChildStore } from "~/stores/useChildStore";
import TimeSelector from "./TimeSelector.vue";
import SnackbarMessage from "./SnackbarMessage.vue";

const props = defineProps({
  childId: { type: String, required: true },
  show: { type: Boolean, default: false },
});

const emits = defineEmits(["closed", "refresh"]);

// Define the sickness model
const sickness = defineModel("sickness", {
  default: {
    id: null, 
    sicknessType: null,
    notes: "",
    fromTime: "12:00",
    toTime: "12:00",
    timingChoice: "currentTime",
    timeOfDay: "morning",
  
    runnyNose: false,
    ear: "both",
    vomiting: false,
    diarrhea: false,
    stomachache: false,
    fussySleep: false,
    gassy: false,
    hasFever: "false", 
    hadMedicine: false,
    medicineTime: "12:00",
    temperature: null, 
  },
});

const childStore = useChildStore();
const localShow = ref(props.show);


const snackbarShow = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");


const hadMedicine = ref(false);
const medicineTime = ref("12:00");

const wholeTemps = Array.from({ length: 7 }, (_, i) => 35 + i); // 35 to 41
const decimalTemps = Array.from({ length: 10 }, (_, i) => i); // 0 to 9

const tempWhole = ref(null);
const tempDecimal = ref(null);

const hasFever = ref("false"); // Default to 'false'


const isConditionalFeverType = computed(() =>
  ["common_cold", "ear_infection", "teething", "vomiting"].includes(
    sickness.value.sicknessType
  )
);
const isAlwaysTempType = computed(() =>
  ["fever", "influenza"].includes(sickness.value.sicknessType)
);


watch(
  () => props.show,
  (val) => {
    localShow.value = val;
    if (val) {
      initializeForm();
    }
  }
);


watch(localShow, (val) => {
  if (!val) emits("closed");
});

function initializeForm() {
  parseTemperature();
  checkHasFeverRadio();
  checkMedicineForAll();
}

function parseTemperature() {

  if (sickness.value.temperature) {
    const parts = sickness.value.temperature.split(".");
    tempWhole.value = parseInt(parts[0], 10);
    tempDecimal.value = parts[1] ? parseInt(parts[1], 10) : 0;
  } else {
    tempWhole.value = null;
    tempDecimal.value = null;
  }
}

function checkHasFeverRadio() {
  if (isConditionalFeverType.value) {
    if (sickness.value.temperature) {
      hasFever.value = "true";
    } else {
      hasFever.value = "false";
    }
  }
}

function checkMedicineForAll() {
  hadMedicine.value = sickness.value.hadMedicine || false;
  medicineTime.value = sickness.value.medicineTime || "12:00";
}

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

function buildSicknessData() {
  const data = {
    sicknessType: sickness.value.sicknessType,
    notes: sickness.value.notes || "",
    timingChoice: sickness.value.timingChoice,
    timestamp: new Date().toISOString(),
  };

  const typesAlwaysTemp = ["fever", "influenza"];
  const typesOptionalTemp = ["common_cold", "ear_infection", "teething", "vomiting"];

  if (typesAlwaysTemp.includes(data.sicknessType)) {
    if (tempWhole.value === null || tempDecimal.value === null) {
      showSnackbar("Please select a temperature.", "error");
      return null;
    }
    data.temperature = `${tempWhole.value}.${tempDecimal.value}`;
  } else if (typesOptionalTemp.includes(data.sicknessType)) {
    if (isConditionalFeverType.value && hasFever.value === "true") {
      if (tempWhole.value === null || tempDecimal.value === null) {
        showSnackbar("Please select a temperature.", "error");
        return null;
      }
      data.temperature = `${tempWhole.value}.${tempDecimal.value}`;
      data.hasFever = true;
    } else {
      data.hasFever = false;
    }
  }

  if (data.sicknessType === "common_cold") {
    data.runnyNose = !!sickness.value.runnyNose;
  }
  if (data.sicknessType === "ear_infection") {
    data.ear = sickness.value.ear || "both";
  }
  if (data.sicknessType === "influenza") {
    data.vomiting = !!sickness.value.vomiting;
    data.diarrhea = !!sickness.value.diarrhea;
  }
  if (data.sicknessType === "teething") {
    data.stomachache = !!sickness.value.stomachache;
    data.fussySleep = !!sickness.value.fussySleep;
    data.gassy = !!sickness.value.gassy;
  }

  // Medicine option for all sickness types
  data.hadMedicine = hadMedicine.value;
  if (hadMedicine.value) {
    data.medicineTime = medicineTime.value;
  }

  // Time logic
  if (sickness.value.timingChoice === "specificTime") {
    const startDate = parseTimeToDate(sickness.value.fromTime);
    data.fromTime = sickness.value.fromTime;
    data.toTime = sickness.value.toTime;
    data.timestamp = startDate.toISOString();
    data.timeOfDay = null;
  } else if (sickness.value.timingChoice === "timeOfDay") {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    data.timestamp = now.toISOString();
    data.timeOfDay = sickness.value.timeOfDay;
    data.fromTime = null;
    data.toTime = null;
  } else if (sickness.value.timingChoice === "currentTime") {
    data.fromTime = null;
    data.toTime = null;
    data.timeOfDay = null;
  }

  if (!data.sicknessType) {
    showSnackbar("Please select a sickness type.", "error");
    return null;
  }

  return data;
}

async function saveSickness() {
  if (!props.childId) {
    console.error("No childId");
    return;
  }

  const sicknessObj = buildSicknessData();
  if (!sicknessObj) {
    // Validation failed
    return;
  }

  try {
    if (sickness.value.id) {
      await childStore.updateSickness(
        props.childId,
        sickness.value.id,
        sicknessObj
      );
      showSnackbar("Sickness updated!", "success");
    } else {
      await childStore.addSickness(props.childId, sicknessObj);
      showSnackbar("Sickness saved!", "success");
    }
    emits("refresh", { message: "Sickness saved!" });
    closeDialog();
  } catch (error) {
    console.error("Error saving sickness:", error);
    showSnackbar("Error saving sickness.", "error");
  }
}

function cancel() {
  closeDialog();
}

function showSnackbar(msg, color = "success") {
  snackbarMessage.value = msg;
  snackbarColor.value = color;
  snackbarShow.value = true;
}
</script>

<style scoped>
</style>
