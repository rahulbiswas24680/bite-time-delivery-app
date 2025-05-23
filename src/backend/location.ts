import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function listenToLocation(userId: string, callback: (location: any) => void) {
  const locationRef = doc(db, "locations", userId);

  return onSnapshot(locationRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
}
