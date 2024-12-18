// pages/overview.vue
<template lang="pug">
  v-container
    // Category Buttons
    v-row.mb-4.justify-center
      v-btn(
        v-for="category in categories"
        :key="category.name"
        :color="selectedCategory === category.name ? category.color : 'grey lighten-2'"
        :variant="selectedCategory === category.name ? 'elevated' : 'text'"
        class="ma-2"
        @click="selectCategory(category.name)"
      )
        | {{ category.displayName }}

    // Calendar Component
    v-calendar(
      v-model="currentDate"
      :events="calendarEvents"
      view-mode="month"
      :allowed-dates="allowedDates"
      :hide-header="false"
      :show-adjacent-months="false"
      :intervals="24"
      :interval-duration="60"
      :interval-format="'fullTime12h'"
      :interval-height="48"
      :weeks-in-month="'dynamic'"
      :min="minDate"
      :max="maxDate"
      :next-icon="'mdi-chevron-right'"
      :prev-icon="'mdi-chevron-left'"
      :first-day-of-week="1"
      :weekdays="[0, 1, 2, 3, 4, 5, 6]"
      class="mb-8"
      @click:event="openDayDetails"
    )
      // Customize day content to show colored dots
      template(#day="{ day }")
        div.d-flex.justify-center.align-center.flex-column
          span {{ day.formatted }}
          div.d-flex
            v-chip(
              v-for="event in day.events"
              :key="event.id"
              small
              :color="getCategoryColor(event.category)"
            )

    // Sparklines Graph
    v-card.pa-4
      v-card-title
        | {{ selectedCategoryDisplay }} Overview
      v-card-text
        Sparklines(
          :model-value="sparklineData"
          :color="getCategoryColor(selectedCategory)"
          :width="300"
          :height="75"
          :line-width="2"
          :smooth="false"
          :show-labels="false"
          type="trend"
        )

    // Day Details Dialog
    v-dialog(v-model="showDayDialog" max-width="600")
      v-card
        v-card-title
          | Loggings for {{ selectedDayFormatted }}
          v-spacer
          v-btn(icon @click="closeDayDetails")
            v-icon mdi-close

        v-card-text
          v-list
            v-list-group(
              v-for="logging in loggingsForSelectedDay"
              :key="logging.id"
              no-action
              :prepend-icon="getCategoryIcon(logging.category)"
              :active="false"
            )
              template(#activator)
                v-row.justify-space-between.align-center
                  span(:style="{ color: getCategoryColor(logging.category) }") {{ logging.category }}
                  span {{ formatTime(logging.timestamp) }}
              v-list-item-subtitle
                div(v-if="logging.category === 'Feeding'")
                  strong Type:
                  |  {{ logging.subCategory }}
                  br
                  strong Volume:
                  |  {{ logging.details.volume }} ml
                  br
                  strong Increment Volume:
                  |  {{ logging.details.incrementVolume }} ml
                  br
                  strong Baby Burped:
                  |  {{ logging.details.babyBurp ? 'Yes' : 'No' }}
                div(v-else-if="logging.category === 'Sleep'")
                  strong From:
                  |  {{ logging.details.fromTime }}
                  br
                  strong To:
                  |  {{ logging.details.toTime }}
                  br
                  strong Duration:
                  |  {{ logging.details.duration }} minutes
                  br
                  strong Quality:
                  |  {{ logging.details.quality }}
                div(v-else-if="logging.category === 'BowelMovement'")
                  strong Times:
                  |  {{ logging.details.times }}
                div(v-else-if="logging.category === 'Sickness'")
                  strong Type:
                  |  {{ logging.details.sicknessType }}
                  br
                  strong Temperature:
                  |  {{ logging.details.temperature }}°C
                  br
                  strong Notes:
                  |  {{ logging.details.notes }}
                  br
                  strong Had Medicine:
                  |  {{ logging.details.hadMedicine ? 'Yes' : 'No' }}
                  br
                  strong Medicine Time:
                  |  {{ logging.details.medicineTime }}
                // Add more categories as needed

        v-card-actions
          v-btn(@click="closeDayDetails") Close
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useChildStore } from '~/stores/useChildStore'
import { useAuthStore } from '~/stores/useAuth' // Import your auth store
import Sparklines from '~/components/Sparklines.vue' // Adjust the path as needed

// Define categories with display names and colors
const categories = [
  { name: 'Feeding', displayName: 'Feeding', color: 'green', icon: 'mdi-bottle-soda' },
  { name: 'Sleep', displayName: 'Sleep', color: 'blue', icon: 'mdi-bed' },
  { name: 'BowelMovement', displayName: 'Bowel Movement', color: 'orange', icon: 'mdi-toilet-paper' },
  { name: 'Sickness', displayName: 'Sickness', color: 'red', icon: 'mdi-thermometer' },
]

// Reactive state
const childStore = useChildStore()
const authStore = useAuthStore()
const currentDate = ref(new Date())
const selectedCategory = ref('Feeding') // Default selected category
const showDayDialog = ref(false)
const selectedDay = ref(null)
const loggingsForSelectedDay = ref([])

// Child selection
const selectedChildId = ref(null)

// Define minDate and maxDate
const minDate = ref(getFormattedDate(new Date())) // Today's date
const maxDate = ref(getFormattedDate(addYears(new Date(), 1))) // One year from today

// Helper function to format Date objects to 'YYYY-MM-DD'
function getFormattedDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to add years to a date
function addYears(date, years) {
  const newDate = new Date(date)
  newDate.setFullYear(newDate.getFullYear() + years)
  return newDate
}

// Initialize listeners on component mount
onMounted(() => {
  if (authStore.user) {
    // Fetch children for the authenticated user
    childStore.fetchChildren(authStore.user.uid).then((children) => {
      if (children.length > 0) {
        selectedChildId.value = children[0].id // Select the first child by default
        childStore.listenToAllLoggings(selectedChildId.value)
      } else {
        console.warn('No children found for the user.')
      }
    })
  } else {
    console.warn('No authenticated user found.')
  }
})

// Watch for aggregatedLoggings to debug any missing 'start' properties
watch(
  () => childStore.aggregatedLoggings,
  (newLoggings) => {
    newLoggings.forEach((logging) => {
      if (!logging.start) {
        console.warn('Logging with missing start date:', logging)
      }
    })
  }
)

// Computed properties
const calendarEvents = computed(() => {
  if (!selectedChildId.value) return []
  // Map aggregated loggings to calendar events
  return childStore.aggregatedLoggings.map((logging) => ({
    id: logging.id,
    category: logging.category,
    title: logging.category,
    start: logging.start, // Use 'start' as per Vuetify's expectation
  }))
})

// Allowed dates (optional, here allowing all dates)
const allowedDates = () => true

// Category selection
function selectCategory(categoryName) {
  selectedCategory.value = categoryName
}

// Get category color
function getCategoryColor(categoryName) {
  const category = categories.find((c) => c.name === categoryName)
  return category ? category.color : 'grey'
}

// Get category icon
function getCategoryIcon(categoryName) {
  const category = categories.find((c) => c.name === categoryName)
  return category ? category.icon : 'mdi-information'
}

// Sparkline data based on selected category
const sparklineData = computed(() => {
  if (!selectedChildId.value) return []
  // Aggregate loggings per day for the selected category
  const dataMap = {}

  childStore.aggregatedLoggings.forEach((logging) => {
    if (logging.category === selectedCategory.value) {
      const date = logging.start // 'start' is in YYYY-MM-DD format
      if (!dataMap[date]) {
        dataMap[date] = 0
      }
      // Customize the increment based on category details
      switch (logging.category) {
        case 'Feeding':
          dataMap[date] += 1 // Modify as needed (e.g., volume)
          break
        case 'Sleep':
          dataMap[date] += 1 // Modify as needed (e.g., duration)
          break
        case 'BowelMovement':
          dataMap[date] += logging.details.times || 1
          break
        case 'Sickness':
          dataMap[date] += 1 // Modify as needed
          break
        default:
          break
      }
    }
  })

  // Sort dates
  const sortedDates = Object.keys(dataMap).sort()

  // Extract counts
  return sortedDates.map((date) => dataMap[date])
})

// Selected category display name
const selectedCategoryDisplay = computed(() => {
  const category = categories.find((c) => c.name === selectedCategory.value)
  return category ? category.displayName : 'Category'
})

// Handle day click
function openDayDetails({ date }) {
  selectedDay.value = date
  loggingsForSelectedDay.value = childStore.aggregatedLoggings.filter(
    (logging) => logging.start === date
  )
  showDayDialog.value = true
}

// Close day details dialog
function closeDayDetails() {
  showDayDialog.value = false
  selectedDay.value = null
  loggingsForSelectedDay.value = []
}

// Format time for display
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Format selected day
const selectedDayFormatted = computed(() => {
  if (!selectedDay.value) return ''
  const date = new Date(selectedDay.value)
  return date.toLocaleDateString()
})
</script>

<style scoped>
/* Optional: Add any page-specific styles here */

/* Style for the colored dots */
.v-chip {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  padding: 0;
}
</style>
