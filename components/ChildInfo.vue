<template lang="pug">
    v-container
      v-row
        v-col(cols="12")
          div(v-if="!hasChild && !showForm")
            p Do you have a child registered?
            v-btn(@click="handleHasChild(true)" color="primary") Yes
            v-btn(@click="handleHasChild(false)" color="primary") No
    
          div(v-else-if="showForm")
            h2 Register Your Child
            v-form(@submit.prevent="saveChild")
              v-text-field(v-model="child.name" label="Child's Name" required outlined)
              v-text-field(v-model="child.age" label="Age (months)" type="number" required outlined)
              v-text-field(v-model="child.weight" label="Weight (kg)" type="number" required outlined)
              v-text-field(v-model="child.height" label="Height (cm)" type="number" required outlined)
              v-btn(type="submit" color="primary") Save
            p {{ message }}
    
          // Visa barnets detaljer OM id finns
          div(v-else-if="childDetails.id")
            h2 Your Child's Details
            p Name: {{ childDetails.name }}
            p Age: {{ childDetails.age }} months
            p Weight: {{ childDetails.weight }} kg
            p Height: {{ childDetails.height }} cm
            br
            // Skicka in childDetails.id till BowelMovements
            bowel-movements(:child-id="childDetails.id")
    </template>
    
    <script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { useAuthStore } from '~/stores/useAuth';
    import { useChildStore } from '~/stores/useChildStore';
    import BowelMovements from './BowelMovements.vue';
    
    const auth = useAuthStore();
    const childStore = useChildStore();
    
    const hasChild = ref(false);
    const showForm = ref(false);
    const child = reactive({
      name: '',
      age: '',
      weight: '',
      height: '',
    });
    const childDetails = reactive({});
    const message = ref('');
    
    function handleHasChild(response) {
      showForm.value = !response;
      if (response) {
        checkForChild();
      }
    }
    
    async function checkForChild() {
      try {
        const children = await childStore.fetchChildren(auth.user.uid);
        if (children.length > 0) {
          Object.assign(childDetails, children[0]);
          hasChild.value = true;
          showForm.value = false;
        } else {
          showForm.value = true;
        }
      } catch (error) {
        console.error('Error fetching child:', error);
      }
    }
    
    async function saveChild() {
      try {
        // Få ID:t på det nya barnet
        const newChildId = await childStore.addChild(auth.user.uid, child);
        message.value = 'Child saved successfully!';
    
        // Hämta om barnets data så vi får ID med i childDetails
        const children = await childStore.fetchChildren(auth.user.uid);
        if (children.length > 0) {
          Object.assign(childDetails, children[0]);
          hasChild.value = true;
          showForm.value = false;
        }
      } catch (error) {
        console.error('Error saving child:', error);
        message.value = 'Error saving child. Please try again.';
      }
    }
    
    onMounted(async () => {
      if (!auth.user) {
        console.error('User not authenticated.');
        return;
      }
      await checkForChild();
    });
    </script>
    