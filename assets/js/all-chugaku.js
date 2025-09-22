import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    getDocs,      // ← 追加
    getDoc,
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
let subjectData = {
    japanese: {
      structure: {
        name: "root",
        type: "folder",
        children: []
      },
      contents: []
    },
    math: {
      structure: {
        name: "root",
        type: "folder",
        children: []
      },
      contents: []
    },

    science: {
      structure: {
        name: "root",
        type: "folder",
        children: []
      },
      contents: []
    },

    "social-studies": {
      structure: {
        name: "root",
        type: "folder",
        children: []
      },
      contents: []
    },

    english: {
      structure: {
        name: "root",
        type: "folder",
        children: []
      },
      contents: []
    }
};

async function rec(structure, folderDoc, s, depth, parent, progress, now, max) {
    const folderData = folderDoc.data();
    const plus = (max - now) / folderData.folders.length;
    let n = now;
    let m = max;
    let count = 0;
    // フォルダ
    for (const folderID of folderData.folders || []) {
        const folDoc = await getDoc(doc(db, "official", s, "structure", folderID));
        if (folDoc.exists()) {
            const folS = {name: folDoc.data().title, type: "folder", children: []};
            const folDiv = document.createElement('div');
            folDiv.className = 'folder';
            folDiv.style.margin = '5px auto 5px 0';
            folDiv.style.width = `${110 - (10 * depth)}%'`;
            const folHeader = document.createElement('div');
            folHeader.className = 'folder-header';
            folHeader.textContent = folDoc.data().title;
            const unitsDiv = document.createElement('div');
            unitsDiv.className = "units hidden";
            folHeader.addEventListener('click', () => {
              if (unitsDiv.classList.contains("hidden")) {
                unitsDiv.classList.remove("hidden");
              } else {
                unitsDiv.classList.add("hidden");
              }
            });
            folDiv.appendChild(folHeader);
            folDiv.appendChild(unitsDiv);
            await rec(folS, folDoc, s, depth + 1, unitsDiv, progress, count * plus + n, (count + 1) * plus + n);
            structure.children.push(folS);
            parent.appendChild(folDiv);
        }
        count++;
    }
    progress.style.width = `${m}%`;
    // ファイル
    for (const fileID of folderData.files || []) {
        const fileDoc = subjectData[s].contents.docs.find(d => d.data().index === fileID);
        if (fileDoc) {
            structure.children.push({
                name: fileDoc.data().title,
                type: "file",
                index: fileDoc.data().index
            });
            const unitDiv = document.createElement("div");
            unitDiv.className = "unit";
            unitDiv.textContent = subjectData[s].contents.docs.find(d => d.data().index === fileID).data().title;
            if ((s == "math" && fileID == 0)
             || (s == "math" && fileID == 1)) { 
              unitDiv.classList.add('fake'); 
            }
            unitDiv.addEventListener("click", (e) => {
              e.stopPropagation();
              if (s == "math" && fileID == 0) {
                window.open('https://lit-kei.github.io/prime/');
              } else if (s == "math" && fileID == 1) {
                window.open('https://lit-kei.github.io/equation/');
              } else {
                const url = `/study/test.html?f=official&subject=${s}&index=${fileID}`;
                window.location.href = url;
              }
            });
            parent.appendChild(unitDiv);
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
  const boxes = document.getElementsByClassName('subject-box');
  let available = [];

  for (let i = 0; i < 5; i++) {
    const snapshot = await getDocs(query(collection(db, "official", subject[i], "contents"), orderBy('index')));
    if (!snapshot.empty) {
      const progress = document.getElementById(`${subject[i]}-progress`);
      progress.style.width = '15%';
      available.push(i);
      subjectData[subject[i]].contents = snapshot;
      const root = await getDoc(doc(db, "official", subject[i], "structure", "root"));
      const unitsD = document.getElementById(`${subject[i]}-units`);
      await rec(subjectData[subject[i]].structure, root, subject[i], 0, unitsD, progress, 15, 100);
      const box = boxes[i];
      progress.style.width = '100%';
      setTimeout(() => {
        progress.style.opacity = "0";
        box.classList.add('available');
      }, 500)
      const header = box.querySelector(".subject-header");
      const unitsDiv = box.querySelector(".units");

      header.addEventListener("click", () => {
        if (unitsDiv.classList.contains("hidden")) {
          unitsDiv.classList.remove("hidden");
        } else {
          unitsDiv.classList.add("hidden");
        }
      });
    }
  }
});
