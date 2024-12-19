// stores/useChildStore.js
import { defineStore } from 'pinia';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { ref, computed } from 'vue';

export const useChildStore = defineStore('child', () => {
  const db = getFirestore();

  // Reactive arrays for each logging category
  const children = ref([]);
  const bowelMovements = ref([]);
  const sleepLogs = ref([]);
  const bottleFeedings = ref([]);
  const breastFeedings = ref([]);
  const solidFeedings = ref([]);
  const sicknesses = ref([]);

  // Aggregated Loggings (Unified List)
  const aggregatedLoggings = computed(() => {
    const allLoggings = [
      ...bowelMovements.value.map((log) => ({
        id: log.id,
        category: 'BowelMovement',
        subCategory: null,
        start: formatDate(log.timestamp),
        timestamp: log.timestamp,
        details: log,
      })),
      ...sleepLogs.value.map((log) => ({
        id: log.id,
        category: 'Sleep',
        subCategory: null,
        start: formatDate(log.timestamp),
        timestamp: log.timestamp,
        details: log,
      })),
      ...bottleFeedings.value.map((log) => ({
        id: log.id,
        category: 'Feeding',
        subCategory: 'Bottle',
        start: formatDate(log.timestamp),
        timestamp: log.timestamp,
        details: log,
      })),
      ...breastFeedings.value.map((log) => ({
        id: log.id,
        category: 'Feeding',
        subCategory: 'Breastfeeding',
        start: formatDate(log.timestamp),
        timestamp: log.timestamp,
        details: log,
      })),
      ...solidFeedings.value.map((log) => ({
        id: log.id,
        category: 'Feeding',
        subCategory: 'SolidFeeding',
        start: formatDate(log.timestamp),
        timestamp: log.timestamp,
        details: log,
      })),
      ...sicknesses.value.map((log) => ({
        id: log.id,
        category: 'Sickness',
        subCategory: null,
        start: formatDate(log.timestamp),
        timestamp: log.timestamp,
        details: log,
      })),
    ];

    allLoggings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return allLoggings;
  });

  // --- Existing Functions ---

  // Add a new child
  async function addChild(userId, childData) {
    const newChildRef = doc(collection(db, 'children'));
    await setDoc(newChildRef, {
      ...childData,
      userId,
      createdAt: new Date().toISOString(),
    });
    return newChildRef.id; // Return the ID of the newly created document
  }

  // Fetch children for a specific user
  async function fetchChildren(userId) {
    const q = query(collection(db, 'children'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    children.value = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    return children.value;
  }

  // --- Bowel Movements Functions ---

  async function addBowelMovementWithTime(childId, movementType, timeOfDay) {
    const bowelMovementsRef = collection(doc(db, 'children', childId), 'bowelMovements');
    const newMovementRef = doc(bowelMovementsRef);
    await setDoc(newMovementRef, {
      movementType,
      timeOfDay,
      timestamp: new Date().toISOString(),
    });
  }

  async function updateBowelMovementWithTime(childId, movementId, movementType, timeOfDay) {
    const movementRef = doc(db, 'children', childId, 'bowelMovements', movementId);
    await setDoc(
      movementRef,
      {
        movementType,
        timeOfDay,
      },
      { merge: true }
    );
  }

  async function deleteBowelMovement(childId, movementId) {
    const movementRef = doc(db, 'children', childId, 'bowelMovements', movementId);
    await deleteDoc(movementRef);
  }

  // Listen to Bowel Movements
  function listenToBowelMovements(childId, callback) {
    const bowelMovementsRef = collection(doc(db, 'children', childId), 'bowelMovements');
    onSnapshot(bowelMovementsRef, (snapshot) => {
      const movements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(movements);
    });
  }

  // --- Sleep Logs Functions ---

  async function addSleepLog(childId, fromTime, toTime) {
    const sleepRef = collection(doc(db, 'children', childId), 'sleep');
    const newSleepRef = doc(sleepRef);
    await setDoc(newSleepRef, {
      fromTime,
      toTime,
      timestamp: new Date().toISOString(),
    });
  }

  async function updateSleepLog(childId, logId, fromTime, toTime) {
    const sleepRef = doc(db, 'children', childId, 'sleep', logId);
    await setDoc(
      sleepRef,
      {
        fromTime,
        toTime,
      },
      { merge: true }
    );
  }

  async function deleteSleepLog(childId, logId) {
    const sleepRef = doc(db, 'children', childId, 'sleep', logId);
    await deleteDoc(sleepRef);
  }

  // Listen to Sleep Logs
  function listenToSleepLogs(childId, callback) {
    const sleepRef = collection(doc(db, 'children', childId), 'sleep');
    onSnapshot(sleepRef, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(logs);
    });
  }

  // --- Bottle Feedings Functions ---

  async function addBottleFeeding(childId, feedingData) {
    // feedingData is expected to be an object containing all fields
    const bottleRef = collection(doc(db, 'children', childId), 'bottle');
    const newFeedingRef = doc(bottleRef);
    await setDoc(newFeedingRef, {
      ...feedingData,
      timestamp: new Date().toISOString(),
    });
  }

  async function updateBottleFeeding(childId, feedingId, feedingData) {
    const feedingRef = doc(db, 'children', childId, 'bottle', feedingId);
    await setDoc(feedingRef, feedingData, { merge: true });
  }

  async function deleteBottleFeeding(childId, feedingId) {
    const feedingRef = doc(db, 'children', childId, 'bottle', feedingId);
    await deleteDoc(feedingRef);
  }

  // Listen to Bottle Feedings
  function listenToBottleFeedings(childId, callback) {
    const bottleRef = collection(doc(db, 'children', childId), 'bottle');
    onSnapshot(bottleRef, (snapshot) => {
      const feedings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(feedings);
    });
  }

  // --- Breastfeeding Functions ---

  async function addBreastfeeding(childId, feedingData) {
    const breastRef = collection(doc(db, 'children', childId), 'breastfeeding');
    const newFeedingRef = doc(breastRef);
    await setDoc(newFeedingRef, {
      ...feedingData,
      timestamp: new Date().toISOString(),
    });
  }

  async function updateBreastfeeding(childId, feedingId, feedingData) {
    const feedingRef = doc(db, 'children', childId, 'breastfeeding', feedingId);
    await setDoc(feedingRef, feedingData, { merge: true });
  }

  async function deleteBreastfeeding(childId, feedingId) {
    const feedingRef = doc(db, 'children', childId, 'breastfeeding', feedingId);
    await deleteDoc(feedingRef);
  }

  // Listen to Breastfeedings
  function listenToBreastfeedings(childId, callback) {
    const breastRef = collection(doc(db, 'children', childId), 'breastfeeding');
    onSnapshot(breastRef, (snapshot) => {
      const feedings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(feedings);
    });
  }

  // --- Solid Feedings Functions ---

  async function addSolidfeeding(childId, feedingData) {
    const solidRef = collection(doc(db, 'children', childId), 'solidfeeding');
    const newFeedingRef = doc(solidRef);
    await setDoc(newFeedingRef, {
      ...feedingData,
      timestamp: new Date().toISOString(),
    });
  }

  async function updateSolidfeeding(childId, feedingId, feedingData) {
    const feedingRef = doc(db, 'children', childId, 'solidfeeding', feedingId);
    await setDoc(feedingRef, feedingData, { merge: true });
  }

  async function deleteSolidfeeding(childId, feedingId) {
    const feedingRef = doc(db, 'children', childId, 'solidfeeding', feedingId);
    await deleteDoc(feedingRef);
  }

  // Listen to Solid Feedings
  function listenToSolidfeedings(childId, callback) {
    const solidRef = collection(doc(db, 'children', childId), 'solidfeeding');
    onSnapshot(solidRef, (snapshot) => {
      solidFeedings.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(solidFeedings.value);
    });
  }

  // --- Sickness Functions ---

  async function addSickness(childId, sicknessData) {
    const sicknessRef = collection(doc(db, 'children', childId), 'sickness');
    const newSicknessRef = doc(sicknessRef);
    await setDoc(newSicknessRef, {
      ...sicknessData,
      timestamp: new Date().toISOString(),
    });
  }

  async function updateSickness(childId, sicknessId, sicknessData) {
    const sicknessRef = doc(db, 'children', childId, 'sickness', sicknessId);
    await setDoc(sicknessRef, sicknessData, { merge: true });
  }

  async function deleteSickness(childId, sicknessId) {
    const sicknessRef = doc(db, 'children', childId, 'sickness', sicknessId);
    await deleteDoc(sicknessRef);
  }

  // Listen to Sicknesses
  function listenToSicknesses(childId, callback) {
    const sicknessRef = collection(doc(db, 'children', childId), 'sickness');
    onSnapshot(sicknessRef, (snapshot) => {
      sicknesses.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(sicknesses.value);
    });
  }

  // --- Aggregated Loggings Functions ---

  // Helper function to format ISO timestamp to YYYY-MM-DD
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date)) {
      console.error('Invalid timestamp:', timestamp);
      return '';
    }
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Months are zero-indexed
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // Listen to all loggings for a child and aggregate them
  function listenToAllLoggings(childId, callbacks) {
    // Initialize or reset all logging arrays
    bowelMovements.value = [];
    sleepLogs.value = [];
    bottleFeedings.value = [];
    breastFeedings.value = [];
    solidFeedings.value = [];
    sicknesses.value = [];

    // Set up listeners for each logging category with their respective callbacks
    listenToBowelMovements(childId, (movements) => {
      bowelMovements.value = movements;
      if (callbacks && typeof callbacks.bowelMovements === 'function') {
        callbacks.bowelMovements(movements);
      }
    });

    listenToSleepLogs(childId, (logs) => {
      sleepLogs.value = logs;
      if (callbacks && typeof callbacks.sleepLogs === 'function') {
        callbacks.sleepLogs(logs);
      }
    });

    listenToBottleFeedings(childId, (feedings) => {
      bottleFeedings.value = feedings;
      if (callbacks && typeof callbacks.bottleFeedings === 'function') {
        callbacks.bottleFeedings(feedings);
      }
    });

    listenToBreastfeedings(childId, (feedings) => {
      breastFeedings.value = feedings;
      if (callbacks && typeof callbacks.breastfeedings === 'function') {
        callbacks.breastfeedings(feedings);
      }
    });

    listenToSolidfeedings(childId, (feedings) => {
      solidFeedings.value = feedings;
      if (callbacks && typeof callbacks.solidfeedings === 'function') {
        callbacks.solidfeedings(feedings);
      }
    });

    listenToSicknesses(childId, (sicknessesData) => {
      sicknesses.value = sicknessesData;
      if (callbacks && typeof callbacks.sicknesses === 'function') {
        callbacks.sicknesses(sicknessesData);
      }
    });
  }

  // Return all functions and reactive states
  return {
    // Existing functions
    addChild,
    fetchChildren,
    addBowelMovementWithTime,
    updateBowelMovementWithTime,
    deleteBowelMovement,
    listenToBowelMovements,
    addSleepLog,
    updateSleepLog,
    deleteSleepLog,
    listenToSleepLogs,
    addBottleFeeding,
    updateBottleFeeding,
    deleteBottleFeeding,
    listenToBottleFeedings,
    addBreastfeeding,
    updateBreastfeeding,
    deleteBreastfeeding,
    listenToBreastfeedings,
    addSolidfeeding,
    updateSolidfeeding,
    deleteSolidfeeding,
    listenToSolidfeedings,
    addSickness,
    updateSickness,
    deleteSickness,
    listenToSicknesses,

    // Aggregated loggings
    aggregatedLoggings,
    listenToAllLoggings,

    // Reactive arrays (optional, in case you need them elsewhere)
    children,
    bowelMovements,
    sleepLogs,
    bottleFeedings,
    breastFeedings,
    solidFeedings,
    sicknesses,
  };
});
