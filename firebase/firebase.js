import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getFirestore, collection, getDocs, updateDoc, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Initialize Firebase with your configuration
const firebaseConfig = {
  apiKey: "AIzaSyAitQUF6D_413pBnp3MwlbwfAwo4h9KEys",
  authDomain: "error-3ea90.firebaseapp.com",
  projectId: "error-3ea90",
  storageBucket: "error-3ea90.appspot.com",
  messagingSenderId: "477757996220",
  appId: "1:477757996220:web:62d31114041a78862724b9",
  measurementId: "G-C3H0D0PWCB"
};

const app = initializeApp(firebaseConfig);

var selectedGender = '';
var selectedUserType = '';

var doctors = [];
var users = [];

var currentChatId = [];



function registerUser(email, password, name, gender, userType) {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      user.type = userType;
      user.name = name;
      user.gender = gender
      user.uid = user.uid;
      if (user.type === 'doctor') user.patientsList = [];
      console.log('user', user);
      addUserToDatabse(user);
    })
    .catch((error) => {
      console.log('error', error);
    });

}

// write a function to return a list of users with as a list of DocumentSnapshop where type == Psychiatrist
async function getDoctors() {
  console.log('hello');
  const db = getFirestore();
  const usersCol = collection(db, 'users');
  const usersSnapshot = getDocs(usersCol);

  const user = JSON.parse(window.localStorage.getItem('uid'));

  usersSnapshot.then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().type === 'Psychiatrist')
        doctors.push(doc.data());
    });
    getUsers().then(() => {
      removeDoctor();
      var doc = getDoctor();
      console.log('user.uid', user.uid);
      console.log('doc.uid', doc.uid);
      createChatRoom(user.uid, doc.uid).then(() => {
        user.chatId = user.uid + '-' + doc.uid;
        window.localStorage.setItem('uid', JSON.stringify(user));
        updateUser(user);
        updateDoctor(user.chatId, doc.uid)
          .then(() => {
            console.log("Document successfully updated!");
            window.location.href = './userChat.html';
          })
          .catch((error) => {
            console.error("Error updating document: ", error);
          });
      });
    });
  });
}

// write a function to return a list of users with as a list of DocumentSnapshop where type == user
async function getUsers() {
  const db = getFirestore();
  const usersCol = collection(db, 'users');
  const usersSnapshot = getDocs(usersCol);
  usersSnapshot.then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().type === 'user')
        users.push(doc.data());
    });
  });
}

// remove the doctor from the list of doctors whos number of patients is greter than total number of docs / total number of users
function removeDoctor() {
  for (var i = 0; i < doctors.length; i++) {
    if (doctors[i].length > (users.length / doctors.length)) {
      doctors.splice(i, 1);
    }
  }
}

// get a doc1tor randomly from the list of doctors
function getDoctor() {
  var randomIndex = Math.floor(Math.random() * doctors.length);
  console.log('doctor', doctors)
  return doctors[randomIndex];
}

async function updateUser(user) {
  const db = getFirestore();
  const docRef = doc(db, "users", user.uid);

}

async function updateDoctor(chatId, doctorId) {
  // check if the current parentList is empty then either add the chatId or create a new array with chatId
  const db = getFirestore();
  const docRef = doc(db, "users", doctorId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    if (docSnap.data().patientsList === undefined) {
      console.log('undefineddddddddd');
      await updateDoc(docRef, {
        patientsList: [chatId],
      });
    } else {
      await updateDoc(docRef, {
        patientsList: arrayUnion(chatId),
      });
    }
  } else {
    console.log("No such document!");
  }

}


function signInUser(email, password) {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      getUserDetails(user.uid).then((data) => {
        console.log('data', data);
        var storeData = {
          name: user.name,
          email: user.email,
          type: user.type,
          gender: user.gender,
        }
        window.localStorage.setItem('uid', JSON.stringify(storeData));
        if (data.type === 'user') window.location.href = '/userHome.html';
        else window.location.href = './psych_Home.html';
      });
      console.log('user', user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

async function createChatRoom(userUid, docUid) {
  const db = getDatabase();
  await set(ref(db, 'chatRooms/' + userUid + '-' + docUid), {
    docUid: docUid,
    userUid: userUid,
  });
}


function readChatRoomAsStream(chatId) {
  const db = getDatabase();
  const chatRoomRef = ref(db, 'chatRooms/' + chatId);
  onValue(chatRoomRef, (snapshot) => {
    const data = snapshot.val();
    console.log('data', data);
  });
}

function addMessageToRoom(chatId, message) {
  const db = getDatabase();
  const user = JSON.parse(window.localStorage.getItem('uid'));
  console.log('user', 'chatRooms/' + chatId + '/messages');
  push(ref(db, 'chatRooms/' + chatId + '/messages'), {
    message: message,
    senderId: user.uid,
    timeStampe: new Date().getTime(),
  });
}

function getUserDetails(uid) {
  const db = getFirestore();
  const docRef = doc(db, "users", uid);
  getDoc(docRef)
    .then((doc) => {
      console.log('getuserdetails');
      if (doc.exists()) {
        console.log("Document data:", doc.data());
        return doc.data();
      } else {
        console.log("No such document!");
        return null;
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
      return null;
    });
}

function addUserToDatabse(user) {
  const db = getFirestore();
  setDoc(doc(db, "users", user.uid), {
    name: user.name,
    email: user.email,
    type: user.type,
    gender: user.gender,
    uid: user.uid,
  })
    .then(() => {
      console.log("Document successfully written!");


      var storeData = {
        name: user.name,
        email: user.email,
        type: user.type,
        gender: user.gender,
        uid: user.uid,
      }
      window.localStorage.setItem('uid', JSON.stringify(storeData));

      if (user.type === 'Psychiatrist') window.location.href = './psych_home.html';
      else window.location.href = './userHome.html';
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });

}

function getCurrentIds() {
  const user = JSON.parse(window.localStorage.getItem('uid'));
  const db = getFirestore();
  const docRef = doc(db, "users", user.uid);


  getDoc(docRef)
    .then((doc) => {
      if (doc.exists()) {
        console.log("Document data:", doc.data());
        currentChatId = doc.data().patientsList;
        console.log('currentChatId', currentChatId);
        setInterval(() => {
          readChatRoomAsStream(currentChatId);
        }, 1000);
        const sendMessage = document.getElementById('sendMessage');
        sendMessage.addEventListener('click', function () {
          const message = document.getElementById('message').value;
          addMessageToRoom(currentChatId, message);
        });
        const savenote = document.getElementById('savenote');
        console.log('savenote', savenote);
        savenote.addEventListener('click', function () {
          const notes = document.getElementById('note').value;
          const chatRoomId = JSON.stringify(currentChatId);

          const patientUid = chatRoomId.split('-')[1].split('"')[0];
          console.log('chatRoomId', patientUid);
          addDocNotes(notes, patientUid);

        });
        return currentChatId;
      } else {
        console.log("No such document!");
        return null;
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
      return null;
    });
}

// add journal entry to the database
function addJournalEntry(journalEntry) {
  // save journal enteries in the database based on timestamp
  const user = JSON.parse(window.localStorage.getItem('uid'));
  const db = getFirestore();
  var docRef = doc(db, "journal", user.uid);
  const timestamp = new Date().getTime();
  // add the data such a a new doc is created for every journal entry 
  setDoc(docRef, {
    lastUpdatedOn: timestamp,
    lastEntry: journalEntry,
  }).then(() => {
    docRef = doc(db, "journal", user.uid + '/entries/' + timestamp);
    setDoc(docRef, {
      entry: journalEntry,
    }).then(() => {
      console.log("Document successfully written!");
    })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  });

}

function getJournalEnteries() {
  const user = JSON.parse(window.localStorage.getItem('uid'));
  const db = getFirestore();
  const docRef = doc(db, "journal", user.uid);
  getDoc(docRef)
    .then((doc) => {
      if (doc.exists()) {
        console.log("Document data:", doc.data());
        return doc.data();
      } else {
        console.log("No such document!");
        return null;
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
      return null;
    });
}

function getDoctorList() {
  const db = getFirestore();
  const usersCol = collection(db, 'users');
  const usersSnapshot = getDocs(usersCol);
  usersSnapshot.then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().type === 'Psychiatrist')
        doctors.push(doc.data());
    });
  });
}

function addDocNotes(notes, patientUid) {
  const db = getFirestore();
  var docRef = doc(db, "users", patientUid);
  const timestamp = new Date().getTime();
  // add the data such a a new doc is created for every Note entry by the psychatrist
  setDoc(docRef, {
    lastUpdatedOn: timestamp,
    lastEntry: notes,
  }).then(() => {
    docRef = doc(db, "users", patientUid + '/notes/' + timestamp);
    setDoc(docRef, {
      entry: notes,
    }).then(() => {
      console.log("Document successfully written!");
    })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  });
}

if (window.location.href.includes('signup.html')) {

  const genderSelect = document.getElementById('gender');
  const userSelect = document.getElementById('userType');
  genderSelect.addEventListener('change', function () {
    selectedGender = genderSelect.value;
    console.log('Selected Gender:', selectedGender);
  });
  userSelect.addEventListener('change', function () {
    selectedUserType = userSelect.value;
    console.log('Selected User Type:', selectedUserType);
  });

  document.getElementById('register').addEventListener('click', function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('username').value;
    registerUser(email, password, name, selectedGender, selectedUserType);

  });
}


if (window.location.href.includes('login.html')) {
  document.getElementById('login_button').addEventListener('click', function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInUser(email, password);
  });

}

if (window.location.href.includes('userChat.html')) {
  const user = JSON.parse(window.localStorage.getItem('uid'));
  console.log('user', user)
  setInterval(() => {
    readChatRoomAsStream(user.chatId);
  }, 1000);
  const sendMessage = document.getElementById('sendMessage');
  sendMessage.addEventListener('click', function () {
    const message = document.getElementById('message').value;
    addMessageToRoom(user.chatId, message);
  });
}

if (window.location.href.includes('selectDoc.html')) {
  const assignDoc = document.getElementById('assignDoc');
  assignDoc.addEventListener('click', function () {
    console.log('assignDoc');
    const user = JSON.parse(window.localStorage.getItem('uid'));
    console.log('user', user);
    getDoctors();
  });
}


if (window.location.href.includes('psych_chat.html')) {
  const user = JSON.parse(window.localStorage.getItem('uid'));
  console.log('user', user)

  var chatIds = getCurrentIds();
  console.log(chatIds)
}

if (window.location.href.includes('journal.html')) {
  const submitJournal = document.getElementById('submitJournal');
  submitJournal.addEventListener('click', function () {
    const journalEntry = document.getElementById('journalEntry').value;
    addJournalEntry(journalEntry);
  });
}

export { readChatRoomAsStream, getCurrentIds, getDoctorList };