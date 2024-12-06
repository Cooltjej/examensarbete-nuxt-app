<template lang="pug">
    v-container
      h2 Bowel Movements
      // Lista över bowel movements
      v-list
        v-list-item(v-for="movement in bowelMovements" :key="movement.id")
          v-list-item-title {{ movement.formattedTimestamp }}: {{ movement.movementType }}
          v-list-item-actions
            v-btn(icon @click="editBowelMovement(movement)")
              v-icon mdi-pencil
            v-btn(icon color="error" @click="deleteBowelMovement(movement.id)")
              v-icon mdi-delete
    
      v-btn(@click="openBowelMovementPopup" color="primary") Add Bowel Movement
    
      // Popup för bowel movement
      v-dialog(v-model="showPopup", persistent, max-width="400")
        v-card
          v-card-title Select Bowel Movement
          v-card-text
            v-btn.mb-2(@click="addBowelMovement('small movement')" color="primary") Small Movement
            v-btn.mb-2(@click="addBowelMovement('large movement')" color="primary") Large Movement
            v-btn.mb-2(@click="addBowelMovement('diarrhea')" color="primary") Diarrhea
            v-btn(@click="addBowelMovement('no movement')" color="primary") No Movement
          v-card-actions
            v-btn(@click="cancelPopup" color="secondary") Cancel
    
      v-snackbar(v-model="snackbar.visible", :timeout="snackbar.timeout", :color="snackbar.color")
        | {{ snackbar.message }}
    </template>
    
    <script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { useChildStore } from '~/stores/useChildStore';
    import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
    
    const db = getFirestore();
    const childStore = useChildStore();
    
    // Ta emot childId som en prop
    const props = defineProps({
      childId: {
        type: String,
        required: true,
      },
    });
    
    const bowelMovements = ref([]);
    const showPopup = ref(false);
    const selectedMovementId = ref(null);
    const snackbar = reactive({
      visible: false,
      message: '',
      color: 'success',
      timeout: 3000,
    });
    
    function openBowelMovementPopup() {
      showPopup.value = true;
    }
    
    function cancelPopup() {
      selectedMovementId.value = null;
      showPopup.value = false;
    }
    
    async function addBowelMovement(movementType) {
      try {
        if (selectedMovementId.value) {
          await childStore.updateBowelMovement(props.childId, selectedMovementId.value, movementType);
          selectedMovementId.value = null;
        } else {
          await childStore.addBowelMovement(props.childId, movementType);
        }
        snackbar.message = `${movementType} ${selectedMovementId.value ? 'updated' : 'added'} successfully!`;
        snackbar.color = 'success';
        snackbar.visible = true;
        showPopup.value = false;
      } catch (error) {
        console.error('Error adding/updating bowel movement:', error);
        snackbar.message = 'Error adding or updating bowel movement.';
        snackbar.color = 'error';
        snackbar.visible = true;
      }
    }
    
    async function deleteBowelMovement(movementId) {
      try {
        const movementRef = doc(db, 'children', props.childId, 'bowelMovements', movementId);
        await deleteDoc(movementRef);
        snackbar.message = 'Movement deleted successfully!';
        snackbar.color = 'success';
        snackbar.visible = true;
      } catch (error) {
        console.error('Error deleting movement:', error);
        snackbar.message = 'Error deleting movement.';
        snackbar.color = 'error';
        snackbar.visible = true;
      }
    }
    
    function editBowelMovement(movement) {
      selectedMovementId.value = movement.id;
      openBowelMovementPopup();
    }
    
    onMounted(() => {
      const updateMovements = (movements) => {
        bowelMovements.value = movements.map((movement) => ({
          ...movement,
          formattedTimestamp: formatTimestamp(movement.timestamp),
        }));
      };
      // Lyssna på förändringar i bowelMovements via childStore
      childStore.listenToBowelMovements(props.childId, updateMovements);
    });
    
    function formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString('sv-SE', {
        timeZone: 'Europe/Stockholm',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    </script>
    