// stores/useChild.js
import { getFirestore, doc, setDoc, collection, getDocs, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';

export const useChildStore = defineStore('child', () => {
  const db = getFirestore();

  async function addChild(userId, childData) {
    await setDoc(doc(collection(db, 'children')), {
      ...childData,
      userId,
      createdAt: new Date().toISOString(),
    });
  }

  async function fetchChildren(userId) {
    const q = query(collection(db, 'children'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  async function addBowelMovement(childId, movementType) {
    const bowelMovementsRef = collection(doc(db, 'children', childId), 'bowelMovements');
    await setDoc(doc(bowelMovementsRef), {
      movementType,
      timestamp: new Date().toISOString(),
    });
  }

  async function updateBowelMovement(childId, movementId, movementType) {
    const movementRef = doc(db, 'children', childId, 'bowelMovements', movementId);
    await setDoc(movementRef, {
      movementType,
      timestamp: new Date().toISOString(),
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

  return {
    addChild,
    fetchChildren,
    addBowelMovement,
    updateBowelMovement, // Exponera funktionen här
    deleteBowelMovement, // Exponera funktionen här
    listenToBowelMovements,
  };
});
