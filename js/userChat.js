// import { readChatRoomAsStream } from '../firebase/firebase.js';


// // $((_) => {
// setInterval(() => {
//   const user = JSON.parse(window.localStorage.getItem('uid'));
//   console.log(user.uid);
//   readChatRoomAsStream(user.uid, (data) => {
    
//     console.log(data);
//     const message = data.message;
//     // const section = document.querySelector("#my-section");
//     // const div = document.createElement("div");
//     // div.classList.add("receiver");
//     // const p = document.createElement("p");
//     // p.textContent = message;
//     // div.appendChild(p);
//     // section.appendChild(div);
//   });
// });
// // });

// const users = ["user", "doctor"];
// const message = "This is the message";
// const section = document.querySelector("#my-section");

// for (let i = 0; i < users.length; i++) {
//   const user = users[i];
//   const div = document.createElement("div");

//   if (user === "user") {
//     div.classList.add("receiver");
//     console.log(user)
//   } else if (user === "doctor") {
//     div.classList.add("sender");
//     console.log(user)
//   }
//   console.log(i)
//   const p = document.createElement("p");
//   p.textContent = message;

//   div.appendChild(p);
//   section.appendChild(div);
// }