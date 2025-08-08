import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    getDocs,      // ← 追加
    query,
    orderBy,
    doc,
    setDoc  } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCC4HW_rNFZHhhH1OzovE9coc_TRlKYJ4I",
  authDomain: "study-1105a.firebaseapp.com",
  projectId: "study-1105a",
  storageBucket: "study-1105a.firebasestorage.app",
  messagingSenderId: "356676590589",
  appId: "1:356676590589:web:cd449cd5ac74e6db449794",
  measurementId: "G-P84CG30Z7N"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const subject = ["japanese", "math", "science", "social-studies", "english"];

document.addEventListener("DOMContentLoaded", async () => {
  const boxes = document.getElementsByClassName('subject-box');
  let subjectData = {
    "japanese": [],
    "math": [],
    "science": [],
    "social-studies": [],
    "english": []
  };
  let available = [];

  for (let i = 0; i < 5; i++) {
    const snapshot = await getDocs(query(collection(db, "official", subject[i], "contents"), orderBy('index')));
    if (!snapshot.empty) {
      available.push(i);
      let data = [];
      snapshot.forEach(doc => {
        data.push(doc.data().title);
      });
      subjectData[subject[i]] = [...data];
    }
  }
  available.forEach(e => {
    boxes[e].classList.add('available');
  });
  document.querySelectorAll(".subject-box.available").forEach(box => {
    const subject = box.dataset.subject;
    const header = box.querySelector(".subject-header");
    const unitsDiv = box.querySelector(".units");

    header.addEventListener("click", () => {
      if (unitsDiv.classList.contains("hidden")) {
        unitsDiv.innerHTML = "";
        for (let i = 0; i < subjectData[subject].length; i++) {
          const unitDiv = document.createElement("div");
          unitDiv.className = "unit";
          unitDiv.textContent = subjectData[subject][i];
          if (subject == "math" && i == 0) { unitDiv.classList.add('fake') }
          unitDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            if (subject == "math" && i == 0) {
              window.open('https://lit-kei.github.io/prime/');
            } else {
              const url = `/study/test.html?f=official&subject=${subject}&unit=${i}`;
              window.location.href = url;
            }
          });
          unitsDiv.appendChild(unitDiv);
        }
        unitsDiv.classList.remove("hidden");
      } else {
        unitsDiv.classList.add("hidden");
      }
    });
  });
});
