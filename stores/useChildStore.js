  // stores/useChild.js
  import { getFirestore, doc, setDoc, collection, getDocs, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';

  export const useChildStore = defineStore('child', () => {
    const db = getFirestore();

    async function addChild(userId, childData) {
      const newChildRef = doc(collection(db, 'children'));
      await setDoc(newChildRef, {
        ...childData,
        userId,
        createdAt: new Date().toISOString(),
      });
      return newChildRef.id; // Returnera ID:t på den nyskapade dokumentet
    }

    async function fetchChildren(userId) {
      const q = query(collection(db, 'children'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async function addBowelMovementWithTime(childId, movementType, timeOfDay) {
      const bowelMovementsRef = collection(doc(db, 'children', childId), 'bowelMovements');
      await setDoc(doc(bowelMovementsRef), {
        movementType,
        timeOfDay,
        timestamp: new Date().toISOString(),
      });
    }

    async function updateBowelMovementWithTime(childId, movementId, movementType, timeOfDay) {
      const movementRef = doc(db, 'children', childId, 'bowelMovements', movementId);
      await setDoc(movementRef, {
        movementType,
        timeOfDay
      }, { merge: true });
    }
    

    async function deleteBowelMovement(childId, movementId) {
      const movementRef = doc(db, 'children', childId, 'bowelMovements', movementId);
      await deleteDoc(movementRef);
    }

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
    async function addSleepLog(childId, fromTime, toTime) {
      const sleepRef = collection(doc(db, 'children', childId), 'sleep');
      const newSleepRef = doc(sleepRef);
      await setDoc(newSleepRef, {
        fromTime,
        toTime,
        timestamp: new Date().toISOString(), // För att sortera på senaste
      });
    }

    async function updateSleepLog(childId, logId, fromTime, toTime) {
      const sleepRef = doc(db, 'children', childId, 'sleep', logId);
      await setDoc(sleepRef, {
        fromTime,
        toTime
      }, { merge: true });
    }

    async function deleteSleepLog(childId, logId) {
      const sleepRef = doc(db, 'children', childId, 'sleep', logId);
      await deleteDoc(sleepRef);
    }

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

    async function addBottleFeeding(childId, feedingData) {
      // feedingData förväntas vara ett objekt innehållande alla fält (volume, incrementVolume, timingChoice, specificTime, timeOfDay, babyBurp, timestamp)
      const bottleRef = collection(doc(db, 'children', childId), 'bottle');
      const newFeedingRef = doc(bottleRef);
      await setDoc(newFeedingRef, {
        ...feedingData
      });
    }
    
    async function updateBottleFeeding(childId, feedingId, feedingData) {
      const feedingRef = doc(db, 'children', childId, 'bottle', feedingId);
      await setDoc(feedingRef, {
        ...feedingData
      }, { merge: true });
    }
    
    async function deleteBottleFeeding(childId, feedingId) {
      const feedingRef = doc(db, 'children', childId, 'bottle', feedingId);
      await deleteDoc(feedingRef);
    }
    
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

    async function addBreastfeeding(childId, feedingData) {
      const breastRef = collection(doc(db, 'children', childId), 'breastfeeding');
      const newFeedingRef = doc(breastRef);
      await setDoc(newFeedingRef, feedingData);
    }
    
    async function updateBreastfeeding(childId, feedingId, feedingData) {
      const feedingRef = doc(db, 'children', childId, 'breastfeeding', feedingId);
      await setDoc(feedingRef, feedingData, { merge: true });
    }
    
    async function deleteBreastfeeding(childId, feedingId) {
      const feedingRef = doc(db, 'children', childId, 'breastfeeding', feedingId);
      await deleteDoc(feedingRef);
    }
    
    function listenToBreastfeedings(childId, callback) {
      const breastRef = collection(doc(db, 'children', childId), 'breastfeeding');
      onSnapshot(breastRef, (snapshot) => {
        const feedings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(feedings);
      });
    }

    async function addSolidfeeding(childId, feedingData) {
      const solidRef = collection(doc(db, 'children', childId), 'solidfeeding');
      const newFeedingRef = doc(solidRef);
      await setDoc(newFeedingRef, feedingData);
    }
    
    async function updateSolidfeeding(childId, feedingId, feedingData) {
      const feedingRef = doc(db, 'children', childId, 'solidfeeding', feedingId);
      await setDoc(feedingRef, feedingData, { merge: true });
    }
    
    async function deleteSolidfeeding(childId, feedingId) {
      const feedingRef = doc(db, 'children', childId, 'solidfeeding', feedingId);
      await deleteDoc(feedingRef);
    }
    
    function listenToSolidfeedings(childId, callback) {
      const solidRef = collection(doc(db, 'children', childId), 'solidfeeding');
      onSnapshot(solidRef, (snapshot) => {
        const feedings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(feedings);
      });
    }

    async function addSickness(childId, sicknessData) {
      const sicknessRef = collection(doc(db, 'children', childId), 'sickness');
      const newSicknessRef = doc(sicknessRef);
      await setDoc(newSicknessRef, sicknessData);
    }
    
    async function updateSickness(childId, sicknessId, sicknessData) {
      const sicknessRef = doc(db, 'children', childId, 'sickness', sicknessId);
      await setDoc(sicknessRef, sicknessData, { merge: true });
    }
    
    async function deleteSickness(childId, sicknessId) {
      const sicknessRef = doc(db, 'children', childId, 'sickness', sicknessId);
      await deleteDoc(sicknessRef);
    }
    
    function listenToSicknesses(childId, callback) {
      const sicknessRef = collection(doc(db, 'children', childId), 'sickness');
      onSnapshot(sicknessRef, (snapshot) => {
        const sicknesses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(sicknesses);
      });
    }
    return {
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
      listenToSicknesses,
      updateSickness,
      deleteSickness,
    };
  });
