<template lang="pug">
  v-container
    h2 Feeding
    div(v-if="childId")
      v-btn(@click="openBottlePopup" color="primary") Bottle
      v-btn(@click="openBreastfeedingPopup" color="primary") Breastfeeding
      v-btn(@click="openSolidFoodPopup" color="primary") Solid Food
  
      // Lista över de fem senaste feedings för bottle
      v-list
        v-list-item(v-for="feeding in bottleFeedings" :key="feeding.id")
          v-list-item-title
            | {{ formatDate(feeding.timestamp) }} 
            | Feeding: {{ feeding.volume }}ml +{{ feeding.incrementVolume }}ml
            br
            | Burp: {{ feeding.babyBurp ? 'Yes' : 'No' }}
            br
            | Time: {{ formatFeedingTime(feeding) }}
  
          template(#append)
            v-btn(icon @click="editBottleFeeding(feeding)")
              v-icon mdi-pencil
            v-btn(icon color="error" @click="deleteBottleFeeding(feeding.id)")
              v-icon mdi-delete
  
      // Popup för Bottle
      v-dialog(v-model="showBottlePopup" persistent max-width="400")
        v-card
          v-card-title Bottle Feeding
          v-card-text
            h3 Bottle Volume (ml)
            v-select(v-model="bottleVolume" :items="bottleVolumeItems" label="Volume" outlined)
  
            h3 Additional Volume (ml)
            v-select(v-model="incrementVolume" :items="incrementVolumeItems" label="Extra Volume" outlined)
  
            h3 Set Feeding Time
            v-radio-group(v-model="timingChoice")
              v-radio(label="Add specific time" value="specificTime")
              v-radio(label="Set time of day" value="timeOfDay")
              v-radio(label="Use current time" value="currentTime")
  
            // Om specificTime vald, visa v-time-picker
            v-time-picker(v-if="timingChoice === 'specificTime'" v-model="specificTimeVal" format="24hr" view="hours")
  
            // Om timeOfDay vald, visa radio för morning/noon etc
            v-radio-group(v-if="timingChoice === 'timeOfDay'" v-model="timeOfDay" class="mt-4")
              v-radio(v-for="item in timeOfDayRadioItems" :key="item.value" :value="item.value" :label="item.title")
  
            h3 Did your baby burp?
            v-radio-group(v-model="babyBurp")
              v-radio(label="Yes" value="yes")
              v-radio(label="No" value="no")
  
          v-card-actions
            v-btn(@click="saveBottleFeeding" color="primary") Save
            v-btn(@click="cancelBottlePopup" color="secondary") Cancel
  
    div(v-else)
      | Loading or no child found...
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { useAuthStore } from '~/stores/useAuth'
  import { useChildStore } from '~/stores/useChildStore'
  
  const auth = useAuthStore()
  const childStore = useChildStore()
  
  const childId = ref(null)
  const bottleFeedings = ref([])
  const showBottlePopup = ref(false)
  const selectedFeedingId = ref(null)
  
  const snackbar = reactive({
    visible: false,
    message: '',
    color: 'success',
    timeout: 3000,
  })
  
  // Data för bottle feeding
  const bottleVolume = ref(null) // ex: 0,100,200...
  const incrementVolume = ref(null) // ex: 5,10,15...
  const timingChoice = ref('currentTime') // 'specificTime', 'timeOfDay', 'currentTime'
  const specificTimeVal = ref('12:00') // om specificTime vald
  const timeOfDay = ref('morning') // om timeOfDay vald
  const babyBurp = ref('no')
  
  const bottleVolumeItems = [0,100,200,300,400] // ml
  const incrementVolumeItems = []
  for (let i=5;i<=95;i+=5) {
    incrementVolumeItems.push(i)
  }
  
  // timeOfDay-radio items
  const timeOfDayRadioItems = [
    { title: "Morning", value: "morning" },
    { title: "Noon", value: "noon" },
    { title: "Afternoon", value: "afternoon" },
    { title: "Evening", value: "evening" },
    { title: "Nighttime", value: "nighttime" },
  ]
  
  function openBottlePopup() {
    resetBottleForm()
    showBottlePopup.value = true
  }
  
  function cancelBottlePopup() {
    selectedFeedingId.value = null
    showBottlePopup.value = false
  }
  
  async function saveBottleFeeding() {
    if (!childId.value) {
      console.error('No childId found')
      return
    }
    if (bottleVolume.value == null || incrementVolume.value == null) {
      showSnackbar('Please select volume options.', 'error')
      return
    }
  
    let feedingTimestamp = new Date() // default current time
    if (timingChoice.value === 'specificTime') {
      // specificTimeVal är "HH:MM"
      const [HH,MM] = specificTimeVal.value.split(':')
      const now = new Date()
      now.setHours(parseInt(HH,10))
      now.setMinutes(parseInt(MM,10))
      feedingTimestamp = now
    } else if (timingChoice.value === 'timeOfDay') {
      // Om timeOfDay vald, spara endast datumet (t.ex. dagens datum med 00:00)
      // eller valfritt beteende. Här sätter vi tiden till kl 12:00.
      const now = new Date()
      now.setHours(12,0,0,0)
      feedingTimestamp = now
    } else if (timingChoice.value === 'currentTime') {
      // Använd feedingTimestamp som redan är current
    }
  
    const burpBool = (babyBurp.value === 'yes')
    
    try {
      if (selectedFeedingId.value) {
        await childStore.updateBottleFeeding(childId.value, selectedFeedingId.value, {
          volume: bottleVolume.value,
          incrementVolume: incrementVolume.value,
          timingChoice: timingChoice.value,
          specificTime: (timingChoice.value === 'specificTime' ? specificTimeVal.value : null),
          timeOfDay: (timingChoice.value === 'timeOfDay' ? timeOfDay.value : null),
          babyBurp: burpBool,
          timestamp: feedingTimestamp.toISOString()
        })
        showSnackbar('Feeding updated successfully!', 'success')
      } else {
        await childStore.addBottleFeeding(childId.value, {
          volume: bottleVolume.value,
          incrementVolume: incrementVolume.value,
          timingChoice: timingChoice.value,
          specificTime: (timingChoice.value === 'specificTime' ? specificTimeVal.value : null),
          timeOfDay: (timingChoice.value === 'timeOfDay' ? timeOfDay.value : null),
          babyBurp: burpBool,
          timestamp: feedingTimestamp.toISOString()
        })
        showSnackbar('Feeding added successfully!', 'success')
      }
      showBottlePopup.value = false
    } catch(error) {
      console.error('Error saving feeding:', error)
      showSnackbar('Error saving feeding.', 'error')
    }
  }
  
  function editBottleFeeding(feeding) {
    selectedFeedingId.value = feeding.id
    bottleVolume.value = feeding.volume
    incrementVolume.value = feeding.incrementVolume
    timingChoice.value = feeding.timingChoice
    if (feeding.timingChoice === 'specificTime' && feeding.specificTime) {
      specificTimeVal.value = feeding.specificTime
    }
    if (feeding.timingChoice === 'timeOfDay' && feeding.timeOfDay) {
      timeOfDay.value = feeding.timeOfDay
    } else {
      timeOfDay.value = 'morning'
    }
    babyBurp.value = feeding.babyBurp ? 'yes' : 'no'
  
    showBottlePopup.value = true
  }
  
  async function deleteBottleFeeding(id) {
    if (!childId.value) return
    try {
      await childStore.deleteBottleFeeding(childId.value, id)
      showSnackbar('Feeding deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting feeding:', error)
      showSnackbar('Error deleting feeding.', 'error')
    }
  }
  
  function openBreastfeedingPopup() {
    // kommande funktionalitet
    showSnackbar('Breastfeeding popup not implemented', 'warning')
  }
  
  function openSolidFoodPopup() {
    // kommande funktionalitet
    showSnackbar('Solid Food popup not implemented', 'warning')
  }
  
  onMounted(async () => {
    if (!auth.user) {
      console.error("User not authenticated.");
      return;
    }
  
    const children = await childStore.fetchChildren(auth.user.uid);
    if (children.length > 0) {
      childId.value = children[0].id;
  
      childStore.listenToBottleFeedings(childId.value, (feedings) => {
        // Sortera och ta fem senaste
        const sorted = feedings.sort((a,b)=> new Date(b.timestamp)-new Date(a.timestamp))
        const recentFive = sorted.slice(0,5)
        bottleFeedings.value = recentFive.map((f) => ({
          ...f,
          formattedTimestamp: formatTimestamp(f.timestamp)
        }))
      })
    } else {
      console.error("No child found.");
    }
  })
  
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
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2,'0')
    const month = String(d.getMonth()+1).padStart(2,'0')
    const year = String(d.getFullYear()).slice(-2)
    return `${day}/${month}-${year}`
  }
  
  function formatFeedingTime(feeding) {
    // Om currentTime valdes, visa full tid
    if (feeding.timingChoice === 'currentTime') {
      return new Date(feeding.timestamp).toLocaleTimeString('sv-SE', {hour:'2-digit', minute:'2-digit'})
    } else if (feeding.timingChoice === 'specificTime') {
      // visa datum + HH:MM från feeding.specificTime
      const d = formatDate(feeding.timestamp)
      return `${d} ${feeding.specificTime}`
    } else if (feeding.timingChoice === 'timeOfDay') {
      // visa datum + feeding.timeOfDay
      const d = formatDate(feeding.timestamp)
      return `${d} ${feeding.timeOfDay}`
    }
    return formatDate(feeding.timestamp)
  }
  
  function showSnackbar(msg, color='success') {
    snackbar.message = msg
    snackbar.color = color
    snackbar.visible = true
  }
  
  function resetBottleForm() {
    bottleVolume.value = null
    incrementVolume.value = null
    timingChoice.value = 'currentTime'
    specificTimeVal.value = '12:00'
    timeOfDay.value = 'morning'
    babyBurp.value = 'no'
    selectedFeedingId.value = null
  }
  </script>
  