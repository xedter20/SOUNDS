const { initializeApp } = require('firebase/app');

const firebaseConfig = {
  apiKey: 'AIzaSyCqs7KyyzpfMkPGoko1_BHQO8NSEKRcXzI',
  authDomain: 'attendance-management-sy-c6521.firebaseapp.com',
  projectId: 'attendance-management-sy-c6521',
  storageBucket: 'attendance-management-sy-c6521.appspot.com',
  messagingSenderId: '53301252777',
  appId: '1:53301252777:web:d9afb6c12173615f1b0fb8',
  measurementId: 'G-CED7W78K4L'
};

const firebase = initializeApp(firebaseConfig);

module.exports = firebase;
