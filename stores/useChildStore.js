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
  return {
    addChild,
    fetchChildren,
    addBowelMovementWithTime,
    updateBowelMovementWithTime, // Exponera funktionen här
    deleteBowelMovement, // Exponera funktionen här
    listenToBowelMovements,
    addSleepLog,
    updateSleepLog,
    deleteSleepLog,
    listenToSleepLogs,
  };
});
