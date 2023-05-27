const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  updateMetadata,
  getBlob,
} = require("firebase/storage");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY0b6dPwo77o4LCkYyySP29ggvT9gV3F4",
  authDomain: "socio-4e2b3.firebaseapp.com",
  projectId: "socio-4e2b3",
  storageBucket: "socio-4e2b3.appspot.com",
  messagingSenderId: "630015762314",
  appId: "1:630015762314:web:32367a565e54c0f02e3273",
  measurementId: "G-JGNE1VVQ9S",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const storageF = getStorage(app);
module.exports = storageF