import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAe_HkOAg15liqfaN3L1mU5RaXi7uw2vco',
  authDomain: 'robot-language-flashcards.firebaseapp.com',
  projectId: 'robot-language-flashcards',
  storageBucket: 'robot-language-flashcards.appspot.com',
  messagingSenderId: '48688472301',
  appId: '1:48688472301:web:12e0b82514eba390e26ce4'
};

export default {
  init: () => {
    firebase.initializeApp(firebaseConfig)
  },
  write: async (data) => {
    data.createdAt = new Date()
    await firebase.firestore().collection('feedback').add(data)
  }
}