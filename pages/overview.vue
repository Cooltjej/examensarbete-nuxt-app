<template lang="pug">
  v-container
    // 1) Category Buttons
    v-row.mb-4.justify-center
      v-btn.my-3(
        v-for="category in categories"
        :key="category.name"
        :color="selectedCategory === category.name ? category.color : 'grey lighten-2'" rounded="xl"
        :variant="selectedCategory === category.name ? 'elevated' : 'text'"
        class="ma-2"
        @click="selectCategory(category.name)"
      )
        | {{ category.displayName }}

   
      

    // 3) 7-Day Sparkline + daily list
    v-card.mt-8.mx-auto.overflow-visible(max-width="400")
      v-sheet.v-sheet--offset.mx-auto(
        color="cyan"
        elevation="12"
        max-width="calc(100% - 32px)"
        rounded="lg"
      )
        v-sparkline(
          :labels="sevenDayStats.labels"
          :model-value="sevenDayStats.value"
          color="white"
          line-width="2"
          padding="16"
        )

      v-card-text.pt-0
        div.text-h6.font-weight-light.mb-2 Past 7 Days ({{ selectedCategoryDisplay }})
        
        v-divider.my-2
        v-icon.me-2(size="small") mdi-clock
        span.text-caption.text-grey.font-weight-light Last 7 days + today

        // List for last 7 days => clicking shows day details
        v-list
          v-list-item(
            v-for="(dayObj, i) in sevenDayStats.dayData"
            :key="i"
            @click="openDayDetails({ date: dayObj.dayKey })"
          )
            v-list-item-title
              strong {{ dayObj.label }}:
              |  {{ dayObj.count }} log(s)

    // 4) Day Details Dialog => only logs from chosen category & date
    v-dialog(
      v-model="showDayDialog"
      max-width="600"
      persistent
      scrollable
    )
      v-card
        v-card-title
          | Loggings for {{ selectedDayFormatted }}
          v-spacer
          v-btn(icon @click="closeDayDetails")
            v-icon mdi-close

        v-card-text
          v-list
            v-list-item(
              v-for="logging in loggingsForSelectedDay"
              :key="logging.id"
            )
              // E.g. "Feeding - 09:17" or "Bowel Movement - 15:41"
              v-list-item-title.font-weight-bold
                | {{ displayCategoryName(logging) }} - {{ simpleTimeOrDate(logging.timestamp) }}

              v-list-item-subtitle
                v-card.mt-2.pa-2(outlined)
                  // =================== FEEDING ===================
                  template(v-if="logging.category === 'Feeding'")
                    v-list-item
                      v-list-item-title Type: {{ displayFeedingSubcat(logging.subCategory) }}
                    template(v-if="logging.subCategory === 'Bottle'")
                      v-list-item
                        v-list-item-title Volume: {{ logging.details.volume }} ml
                      v-list-item
                        v-list-item-title Additional Volume: {{ logging.details.incrementVolume || 0 }} ml
                    template(v-else-if="logging.subCategory === 'Breastfeeding'")
                      v-list-item
                        v-list-item-title Breast: {{ logging.details.breast }}
                    template(v-else-if="logging.subCategory === 'SolidFeeding'")
                      v-list-item
                        v-list-item-title Solid Type: {{ logging.details.solidType }}
                      v-list-item
                        v-list-item-title Amount: {{ getAmountText(logging.details) }}
                    v-list-item
                      v-list-item-title Baby Burped: {{ logging.details.babyBurp ? 'Yes' : 'No' }}

                  // =================== BOWEL MOVEMENT ===================
                  template(v-else-if="logging.category === 'BowelMovement'")
                    v-list-item
                      v-list-item-title Movement Type: {{ logging.details.movementType }}
                    v-list-item
                      v-list-item-title Time of Day: {{ logging.details.timeOfDay }}

                  // =================== SLEEP ===================
                  template(v-else-if="logging.category === 'Sleep'")
                    v-list-item
                      v-list-item-title From: {{ logging.details.fromTime }}
                    v-list-item
                      v-list-item-title To: {{ logging.details.toTime }}

                  // =================== SICKNESS ===================
                  template(v-else-if="logging.category === 'Sickness'")
                    v-list-item
                      v-list-item-title Type: {{ displaySicknessName(logging.details.sicknessType) }}
                    v-list-item(v-if="logging.details.temperature")
                      v-list-item-title Temperature: {{ logging.details.temperature }}°C

                    v-list-item
                      v-list-item-title Had Medicine: {{ logging.details.hadMedicine ? 'Yes' : 'No' }}
                    v-list-item(v-if="logging.details.hadMedicine")
                      v-list-item-title Medicine Time: {{ logging.details.medicineTime }}

                    template(v-if="logging.details.sicknessType === 'common_cold'")
                      v-list-item
                        v-list-item-title Runny Nose: {{ logging.details.runnyNose ? 'Yes' : 'No' }}

                    template(v-if="logging.details.sicknessType === 'ear_infection'")
                      v-list-item
                        v-list-item-title Affected Ear: {{ logging.details.ear }}

                    template(v-if="logging.details.sicknessType === 'influenza'")
                      v-list-item
                        v-list-item-title Vomiting: {{ logging.details.vomiting ? 'Yes' : 'No' }}
                      v-list-item
                        v-list-item-title Diarrhea: {{ logging.details.diarrhea ? 'Yes' : 'No' }}

                    template(v-if="logging.details.sicknessType === 'teething'")
                      v-list-item
                        v-list-item-title Stomachache: {{ logging.details.stomachache ? 'Yes' : 'No' }}
                      v-list-item
                        v-list-item-title Fussy Sleep: {{ logging.details.fussySleep ? 'Yes' : 'No' }}
                      v-list-item
                        v-list-item-title Gassy: {{ logging.details.gassy ? 'Yes' : 'No' }}

                    // Move Notes last
                    v-list-item(v-if="logging.details.notes")
                      v-list-item-title Notes: {{ logging.details.notes }}

        v-card-actions
          v-btn(@click="closeDayDetails") Close
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { format } from "date-fns";
import { useChildStore } from "~/stores/useChildStore";
import { useAuthStore } from "~/stores/useAuth";
import Sparklines from "~/components/Sparklines.vue";

// Categories
const categories = [
  { name: "Feeding", displayName: "Feeding", color: "green" },
  { name: "Sleep", displayName: "Sleep", color: "blue" },
  { name: "BowelMovement", displayName: "Bowel Movement", color: "orange" },
  { name: "Sickness", displayName: "Sickness", color: "purple-lighten-1" },
];

const childStore = useChildStore();
const authStore = useAuthStore();

const selectedCategory = ref("Feeding");
const showDayDialog = ref(false);
const selectedDay = ref(null);
const loggingsForSelectedDay = ref([]);
const selectedChildId = ref(null);

// =================== UTILITY FUNCTIONS ===================

// Display a friendlier category name
function displayCategoryName(logging) {
  const cat = categories.find((c) => c.name === logging.category);
  return cat ? cat.displayName : logging.category || "Unknown";
}

// Subcategory label for feedings
function displayFeedingSubcat(subcat) {
  // E.g. "Bottle", "Breastfeeding", or "SolidFeeding" => "Solid Feeding"
  if (subcat === "Bottle") return "Bottle";
  if (subcat === "Breastfeeding") return "Breastfeeding";
  if (subcat === "SolidFeeding") return "Solid Feeding";
  return subcat || "Unknown";
}

// If user used strings like "ear_infection", "common_cold", etc.
function displaySicknessName(str) {
  if (!str) return "";
  const map = {
    ear_infection: "Ear Infection",
    common_cold: "Common Cold",
    teething: "Teething",
    fever: "Fever",
    influenza: "Influenza",
    vomiting: "Vomiting",
  };
  if (map[str]) return map[str];
  // fallback => convert underscores
  return str
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

// For solid feedings => same logic as your "feeding" page
function getAmountText(details) {
  if (details.jarChoice === "half") return "Half a jar";
  if (details.jarChoice === "full") return "Full jar";
  if (
    details.jarChoice === "teaspoon" ||
    details.tastingChoice === "teaspoon"
  ) {
    return (
      details.amount ||
      (details.teaspoonAmount
        ? `${details.teaspoonAmount} teaspoon(s)`
        : "Not specified")
    );
  }
  if (details.squeezeChoice === "half") return "Half a squeeze bag";
  if (details.squeezeChoice === "full") return "Full squeeze bag";
  if (details.squeezeChoice === "several") {
    return details.squeezeAmount
      ? `${details.squeezeAmount} squeeze bag(s)`
      : "Not specified";
  }
  if (details.ownAmount) return details.ownAmount;
  return details.amount || "Not specified";
}

// Return a short "HH:MM" for the timestamp
function simpleTimeOrDate(timestamp) {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Switch category
function selectCategory(name) {
  selectedCategory.value = name;
}

// On mount => fetch child => listen logs
onMounted(() => {
  if (authStore.user) {
    childStore.fetchChildren(authStore.user.uid).then((children) => {
      if (children.length > 0) {
        selectedChildId.value = children[0].id;
        childStore.listenToAllLoggings(selectedChildId.value, {});
      } else {
        console.warn("No child found.");
      }
    });
  } else {
    console.warn("No authenticated user found.");
  }
});

// Check missing .start
watch(
  () => childStore.aggregatedLoggings,
  (logs) => {
    logs.forEach((log) => {
      if (!log.start) {
        console.warn("Missing .start =>", log);
      }
    });
  }
);

// A simpler sparkline
const sparklineData = computed(() => {
  if (!selectedChildId.value) return [];
  const dataMap = {};
  childStore.aggregatedLoggings.forEach((log) => {
    if (log.category === selectedCategory.value) {
      const dateKey = log.start;
      if (!dataMap[dateKey]) dataMap[dateKey] = 0;
      if (log.category === "BowelMovement") {
        dataMap[dateKey] += log.details.times || 1;
      } else {
        dataMap[dateKey] += 1;
      }
    }
  });
  const sortedDates = Object.keys(dataMap).sort();
  return sortedDates.map((d) => dataMap[d]);
});

// 7-day logic
function getLast7Days() {
  const arr = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    arr.push(d);
  }
  return arr;
}
const sevenDayStats = computed(() => {
  const days = getLast7Days();
  const labels = [];
  const value = [];
  const dayData = [];

  days.forEach((day) => {
    const labelStr = format(day, "MM/dd");
    labels.push(labelStr);
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, "0");
    const dd = String(day.getDate()).padStart(2, "0");
    const dayKey = `${yyyy}-${mm}-${dd}`;

    let dailyCount = 0;
    childStore.aggregatedLoggings.forEach((log) => {
      if (log.start === dayKey && log.category === selectedCategory.value) {
        if (log.category === "BowelMovement") {
          dailyCount += log.details.times || 1;
        } else {
          dailyCount += 1;
        }
      }
    });
    value.push(dailyCount);
    dayData.push({ label: labelStr, dayKey, count: dailyCount });
  });

  return { labels, value, dayData };
});

// Show day details => filter logs by date+cat
function openDayDetails({ date }) {
  selectedDay.value = date;
  loggingsForSelectedDay.value = childStore.aggregatedLoggings.filter(
    (log) => log.start === date && log.category === selectedCategory.value
  );
  showDayDialog.value = true;
}
function closeDayDetails() {
  showDayDialog.value = false;
  selectedDay.value = null;
  loggingsForSelectedDay.value = [];
}
const selectedDayFormatted = computed(() => {
  if (!selectedDay.value) return "";
  const d = new Date(selectedDay.value);
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString();
});

// Return the color for current category
function getCategoryColor(catName) {
  const c = categories.find((x) => x.name === catName);
  return c ? c.color : "grey";
}

const selectedCategoryDisplay = computed(() => {
  const c = categories.find((x) => x.name === selectedCategory.value);
  return c ? c.displayName : "Category";
});
</script>

<style scoped>
.v-sheet--offset {
  position: relative;
  top: -24px;
}
</style>
