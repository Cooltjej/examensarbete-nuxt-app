<template lang="pug">
  v-container
    h2.h2 Feeding
    div(v-if="childId")
      v-btn(@click="openBottle" color="green" rounded="xl") Bottle
      v-btn(@click="openBreast" color="green" rounded="xl") Breastfeeding
      v-btn(@click="openSolid" color="green" rounded="xl") Solid
      h3.h3 Latest Feedings
      v-list
        v-list-item(v-for="feeding in allFeedings" :key="feeding.id")
          v-list-item-title
            span.font-weight-bold
              | {{ formatDate(feeding.timestamp) }}
            // Visa datum
            
            br
            template(v-if="feeding.type === 'bottle'")
              span.text-decoration-underline Bottle feeding: 
              br 
              | {{ feeding.volume }}ml +{{ feeding.incrementVolume }}ml
              br
              | Did baby burp: {{ feeding.babyBurp ? 'Yes' : 'No' }}
              br
              | {{ formatTime(feeding) }}

            template(v-else-if="feeding.type === 'breastfeeding'")
              span.text-decoration-underline Breastfeeding:
              br
              | Breast: {{ feeding.breast }}
              br
              // istället för From ... to ...
              | {{ formatTime(feeding) }}
              br
              | Did baby burp: {{ feeding.babyBurp ? 'Yes' : 'No' }}

            template(v-else-if="feeding.type === 'solidfeeding'")
              span.text-decoration-underline Solid Food:
              br
              | Solid Type: {{ feeding.solidType }}
              br
              | Amount: {{ feeding.amount }}
              br
              | {{ formatTime(feeding) }}
              br
              

          template(#append)
            v-btn(icon @click="editFeeding(feeding)")
              v-icon mdi-pencil
            v-btn(icon color="error" @click="deleteFeeding(feeding)")
              v-icon mdi-delete

      // Komponenter för popups
      bottle-feeding(
        v-if="showBottle"
        :child-id="childId"
        :show="showBottle"
        :feeding="editFeedingData"
        @closed="closeBottle"
        @refresh="handleRefresh($event)"
      )

      breast-feeding(
        v-if="showBreast"
        :child-id="childId"
        :show="showBreast"
        v-model:feeding="editFeedingData"
        @closed="closeBreast"
        @refresh="handleRefresh($event)"
      )

      solid-feeding(
        v-if="showSolid"
        :child-id="childId"
        :show="showSolid"
        v-model:feeding="editFeedingData"
        @closed="closeSolid"
        @refresh="handleRefresh($event)"
      )

    div(v-else)
      | Loading or no child found...

  // Snackbar
  snackbar-message(
    :message="snackbarMessage"
    :color="snackbarColor"
    :show="snackbarShow"
    @update:show="snackbarShow = $event"
  )
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/useAuth";
import { useChildStore } from "~/stores/useChildStore";
import BottleFeeding from "~/components/BottleFeeding.vue";
import BreastFeeding from "~/components/BreastFeeding.vue";
import SolidFeeding from "~/components/SolidFeeding.vue";
import SnackbarMessage from "~/components/SnackbarMessage.vue";

const auth = useAuthStore();
const childStore = useChildStore();

const childId = ref(null);

// Visa/hide popups
const showBottle = ref(false);
const showBreast = ref(false);
const showSolid = ref(false);

// Hantera vilken feeding vi redigerar
const editFeedingData = ref(null);

// Lista över feedings
let bottleList = [];
let breastList = [];
let solidList = [];
const allFeedings = ref([]);

// Snackbar-states
const snackbarShow = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

onMounted(async () => {
  if (!auth.user) {
    console.error("User not authenticated.");
    return;
  }
  const children = await childStore.fetchChildren(auth.user.uid);
  if (children.length > 0) {
    childId.value = children[0].id;

    childStore.listenToBottleFeedings(childId.value, (feedings) => {
      bottleList = feedings.map((f) => ({ ...f, type: "bottle" }));
      updateAllFeedings();
    });

    childStore.listenToBreastfeedings(childId.value, (feedings) => {
      breastList = feedings.map((f) => ({ ...f, type: "breastfeeding" }));
      updateAllFeedings();
    });

    childStore.listenToSolidfeedings(childId.value, (feedings) => {
      solidList = feedings.map((f) => ({ ...f, type: "solidfeeding" }));
      updateAllFeedings();
    });
  } else {
    console.error("No child found.");
  }
});

function openBottle() {
  editFeedingData.value = {
    volume: null,
    incrementVolume: null,
    fromTime: "12:00",
    toTime: "12:00",
    timingChoice: "currentTime",
    timeOfDay: "morning",
    babyBurp: false,
  }; // Ny feeding
  showBottle.value = true;
}

function openBreast() {
  // Instead of null, set the default feeding data you want.
  editFeedingData.value = {
    breast: "left",
    fromTime: "12:00",
    toTime: "12:00",
    timingChoice: "currentTime",
    timeOfDay: "morning",
    babyBurp: false,
  };
  showBreast.value = true;
}

function openSolid() {
  editFeedingData.value = {
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
  showSolid.value = true;
}

function closeBottle() {
  showBottle.value = false;
  editFeedingData.value = null;
}

function closeBreast() {
  showBreast.value = false;
  editFeedingData.value = null;
}

function closeSolid() {
  showSolid.value = false;
  editFeedingData.value = null;
}

function updateAllFeedings() {
  const combined = [...bottleList, ...breastList, ...solidList];
  const sorted = combined.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  allFeedings.value = sorted.slice(0, 15);
}

function editFeeding(feeding) {
  editFeedingData.value = feeding;
  if (feeding.type === "bottle") {
    showBottle.value = true;
  } else if (feeding.type === "breastfeeding") {
    showBreast.value = true;
  } else if (feeding.type === "solidfeeding") {
    showSolid.value = true;
  }
}

async function deleteFeeding(feeding) {
  if (!childId.value) return;
  try {
    if (feeding.type === "bottle") {
      await childStore.deleteBottleFeeding(childId.value, feeding.id);
    } else if (feeding.type === "breastfeeding") {
      await childStore.deleteBreastfeeding(childId.value, feeding.id);
    } else if (feeding.type === "solidfeeding") {
      await childStore.deleteSolidfeeding(childId.value, feeding.id);
    }
    showSnackbar("Feeding deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting feeding:", error);
    showSnackbar("Error deleting feeding.", "error");
  }
}

function handleRefresh(eventData) {
  if (eventData && eventData.message) {
    showSnackbar(eventData.message, eventData.color || "success");
  } else {
    showSnackbar("Data updated successfully!", "success");
  }
  // Lyssnare uppdaterar redan listorna
}

function showSnackbar(msg, color = "success") {
  snackbarMessage.value = msg;
  snackbarColor.value = color;
  snackbarShow.value = true;
}

// Hjälpfunktioner för format
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}-${year}`;
}

function formatTime(entry) {
  // Renamed parameter from 'feeding' to 'entry' for generality
  if (
    entry.type === "bottle" ||
    entry.type === "breastfeeding" ||
    entry.type === "solidfeeding" ||
    entry.type === "sickness"
  ) {
    if (entry.timingChoice === "currentTime") {
      return new Date(entry.timestamp).toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (entry.timingChoice === "specificTime") {
      const d = formatDate(entry.timestamp);
      return `${d} ${entry.fromTime} - ${entry.toTime}`;
    } else if (entry.timingChoice === "timeOfDay") {
      const d = formatDate(entry.timestamp);
      return `${d} ${entry.timeOfDay}`;
    }
    return formatDate(entry.timestamp);
  }
  return "";
}
</script>
