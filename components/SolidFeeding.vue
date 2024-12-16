<template lang="pug">
  v-dialog(v-model="localShow" persistent max-width="400")
    v-card
    v-card-title Solid Feeding
    v-card-text
        h3 Select portion type
        v-select(
        v-model="feedingData.solidType"
        :items="solidTypeItems"
        item-title="text"
        item-value="value"
        label="Solid Type"
        outlined
        )

        // Visa sektioner beroende på vilken solidType som valts
        template(v-if="feedingData.solidType === 'jar'")
        h3 How much did your baby eat?
        v-radio-group(v-model="feedingData.jarChoice")
            v-radio(label="Half a jar" value="half")
            v-radio(label="Full jar" value="full")
            v-radio(label="Tea Spoon" value="teaspoon")
            v-radio(label="Own input" value="own")

        template(v-if="feedingData.jarChoice === 'teaspoon'")
            v-select(
            v-model="feedingData.teaspoonAmount"
            :items="teaspoonItems"
            label="How many?"
            outlined
            )

        template(v-if="feedingData.jarChoice === 'own'")
            v-text-field(
            v-model="feedingData.ownAmount"
            label="Amount eaten"
            outlined
            )

        template(v-else-if="feedingData.solidType === 'squeeze'")
        h3 How much did your baby eat?
        v-radio-group(v-model="feedingData.squeezeChoice")
            v-radio(label="Half a squeeze bag" value="half")
            v-radio(label="Full squeeze bag" value="full")
            v-radio(label="Several squeeze bags" value="several")
            v-radio(label="Own input" value="own")

        template(v-if="feedingData.squeezeChoice === 'several'")
            v-select(
            v-model="feedingData.squeezeAmount"
            :items="squeezeItems"
            label="How many?"
            outlined
            )

        template(v-if="feedingData.squeezeChoice === 'own'")
            v-text-field(
            v-model="feedingData.ownAmount"
            label="Amount eaten"
            outlined
            )

        template(v-else-if="feedingData.solidType === 'tasting'")
        h3 How much did your baby taste?
        v-radio-group(v-model="feedingData.tastingChoice")
            v-radio(label="Tea Spoons" value="teaspoon")
            v-radio(label="Own input" value="own")

        template(v-if="feedingData.tastingChoice === 'teaspoon'")
            v-select(
            v-model="feedingData.teaspoonAmount"
            :items="teaspoonItems"
            label="How many?"
            outlined
            )

        template(v-if="feedingData.tastingChoice === 'own'")
            v-text-field(
            v-model="feedingData.ownAmount"
            label="Amount eaten"
            outlined
            )

        // Tidshantering (TimeSelector)
        time-selector(
        v-model:timingChoice="feedingData.timingChoice"
        v-model:fromTime="feedingData.fromTime"
        v-model:toTime="feedingData.toTime"
        v-model:timeOfDay="feedingData.timeOfDay"
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
    feeding: { 
      type: Object,
      default: () => ({
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
      })
    }
  });
  const emits = defineEmits(["closed","refresh"]);

  const feedingData = ref({ ...props.feeding });

  const localShow = ref(props.show);
  watch(() => props.show, val => {
    localShow.value = val;
    if (val && props.feeding) {
      console.log("SolidFeeding: editing existing feeding", props.feeding);
      loadFeeding(props.feeding);
    } else if (val && !props.feeding) {
      console.log("SolidFeeding: new feeding");
      resetForm();
    }
  });

  watch(localShow, val => {
    if (!val) emits("closed");
  });

  const childStore = useChildStore();

  const snackbarShow = ref(false);
  const snackbarMessage = ref("");
  const snackbarColor = ref("success");
  function showSnackbar(msg, color = "success") {
    console.log("showSnackbar:", msg, color);
    snackbarMessage.value = msg;
    snackbarColor.value = color;
    snackbarShow.value = true;
  }

  const solidTypeItems = [
    { text: "Jar (190g)", value: "jar" },
    { text: "Squeeze bag (120g)", value: "squeeze" },
    { text: "Tasting portion", value: "tasting" }
  ];

  const teaspoonItems = [];
  for (let i = 1; i <= 10; i++) {
    teaspoonItems.push(i);
  }

  const squeezeItems = [];
  for (let i = 1; i <= 5; i++) {
    squeezeItems.push(i);
  }

  function resetForm() {
    console.log("SolidFeeding: resetForm");
    feedingData.value = {
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
    };
  }

  function loadFeeding(f) {
    console.log("SolidFeeding: loadFeeding", f);
    feedingData.value = { ...f };
    if (!feedingData.value.fromTime) feedingData.value.fromTime = "12:00";
    if (!feedingData.value.toTime) feedingData.value.toTime = "12:00";
    if (!feedingData.value.timingChoice) feedingData.value.timingChoice = "currentTime";
    if (!feedingData.value.timeOfDay) feedingData.value.timeOfDay = "morning";
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

  function buildFeedingData() {
    console.log("SolidFeeding: buildFeedingData med feedingData:", feedingData.value);
    const data = {
      solidType: feedingData.value.solidType,
      timingChoice: feedingData.value.timingChoice,
      timestamp: new Date().toISOString()
    };

    if (feedingData.value.timingChoice === "specificTime") {
      const startDate = parseTimeToDate(feedingData.value.fromTime);
      data.fromTime = feedingData.value.fromTime;
      data.toTime = feedingData.value.toTime;
      data.timestamp = startDate.toISOString();
      data.timeOfDay = null;
    } else if (feedingData.value.timingChoice === "timeOfDay") {
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      data.timestamp = now.toISOString();
      data.timeOfDay = feedingData.value.timeOfDay;
      data.fromTime = null;
      data.toTime = null;
    } else if (feedingData.value.timingChoice === "currentTime") {
      data.fromTime = null;
      data.toTime = null;
      data.timeOfDay = null;
    }

    if (data.solidType === "jar") {
      data.jarChoice = feedingData.value.jarChoice;
      if (feedingData.value.jarChoice === "teaspoon") {
        if (!feedingData.value.teaspoonAmount) {
          showSnackbar("Please select number of teaspoons.", "error");
          return null;
        }
        data.amount = feedingData.value.teaspoonAmount + " teaspoon(s)";
      } else if (feedingData.value.jarChoice === "own") {
        if (!feedingData.value.ownAmount) {
          showSnackbar("Please input amount eaten.", "error");
          return null;
        }
        data.amount = feedingData.value.ownAmount;
      } else if (feedingData.value.jarChoice === "half") {
        data.amount = "Half a jar";
      } else if (feedingData.value.jarChoice === "full") {
        data.amount = "Full jar";
      } else {
        showSnackbar("Please select how much from jar.", "error");
        return null;
      }
    } else if (data.solidType === "squeeze") {
      data.squeezeChoice = feedingData.value.squeezeChoice;
      if (feedingData.value.squeezeChoice === "several") {
        if (!feedingData.value.squeezeAmount) {
          showSnackbar("Please select number of squeeze bags.", "error");
          return null;
        }
        data.amount = feedingData.value.squeezeAmount + " squeeze bag(s)";
      } else if (feedingData.value.squeezeChoice === "own") {
        if (!feedingData.value.ownAmount) {
          showSnackbar("Please input amount eaten.", "error");
          return null;
        }
        data.amount = feedingData.value.ownAmount;
      } else if (feedingData.value.squeezeChoice === "half") {
        data.amount = "Half a squeeze bag";
      } else if (feedingData.value.squeezeChoice === "full") {
        data.amount = "Full squeeze bag";
      } else {
        showSnackbar("Please select how much from squeeze bag.", "error");
        return null;
      }
    } else if (data.solidType === "tasting") {
      data.tastingChoice = feedingData.value.tastingChoice;
      if (feedingData.value.tastingChoice === "teaspoon") {
        if (!feedingData.value.teaspoonAmount) {
          showSnackbar("Please select number of teaspoons.", "error");
          return null;
        }
        data.amount = feedingData.value.teaspoonAmount + " teaspoon(s)";
      } else if (feedingData.value.tastingChoice === "own") {
        if (!feedingData.value.ownAmount) {
          showSnackbar("Please input amount eaten.", "error");
          return null;
        }
        data.amount = feedingData.value.ownAmount;
      } else {
        showSnackbar("Please select how much tasted.", "error");
        return null;
      }
    } else {
      showSnackbar("Please select a solid type.", "error");
      return null;
    }

    console.log("SolidFeeding: buildFeedingData result:", data);
    return data;
  }

  async function saveFeeding() {
    if (!props.childId) {
      console.error("No childId");
      return;
    }

    const feedingObj = buildFeedingData();
    if (!feedingObj) {
      // validering failade
      return;
    }

    console.log("SolidFeeding: saveFeeding feedingObj:", feedingObj);
    try {
      if (props.feeding && props.feeding.id) {
        console.log("SolidFeeding: updateSolidFeeding anropas");
        await childStore.updateSolidFeeding(props.childId, props.feeding.id, feedingObj);
        showSnackbar("Solid feeding updated!", "success");
      } else {
        console.log("SolidFeeding: addSolidFeeding anropas");
        await childStore.addSolidFeeding(props.childId, feedingObj);
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