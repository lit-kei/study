import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    updateDoc,
    doc,
    getDocs,
    getDoc,
    increment,
    setDoc,
    limit,
    orderBy,
    query } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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


const subjects = [
  {name: "国語", color: "#E57373"},
  {name: "数学", color: "#64B5F6"},
  {name: "理科", color: "#4DB6AC"},
  {name: "社会", color: "#FBC02D"},
  {name: "英語", color: "#FF67AD"},

  {name: "音楽", color: "#d1a648ff"},
  {name: "家庭科", color: "#A1887F"},
  {name: "技術", color: "#689F8F"},
  {name: "美術", color: "#b64587"},
  {name: "保体", color: "#c93333ff"},
  {name: "その他", color: "#BA68C8"}
];

const hisTbody = document.getElementById('his-tbody');
const modal = document.getElementById('modal');
let Posts = []; 
let Fixed = [];
let filterBtns = JSON.parse(localStorage.getItem('setting')) ?? [false, false, false];
let fixedFil = true;
let currentBoxes = [];
const btns = ["favorite-fil", "good-fil", "subject-fil"];
let fin = false;
let isProcessing = false;
let favorites = JSON.parse(localStorage.getItem('favorites'));
if (favorites === null) { 
  favorites = [];
  localStorage.setItem('favorites', JSON.stringify([]));
}


/*await setDoc(doc(db, "posts", "morusushingowooboeyo"), {
  title: "モールス信号",
  subject: 7,
  display: "fixed",
  contents: {
  question: ["A",
"B",
"C",
"D",
"E",
"F",
"G",
"H",
"I",
"J",
"K",
"L",
"M",
"N",
"O",
"P",
"Q",
"R",
"S",
"T",
"U",
"V",
"W",
"X",
"Y",
"Z",
"0",
"1",
"2",
"3",
"4",
"5",
"6",
"7",
"8",
"9"],
answer: ["・ー",
"ー・・・",
"ー・－・",
"ー・・",
"・",
"・・ー・",
"ーー・",
"・・・・",
"・・",
"・ーーー",
"ー・ー",
"・ー・・",
"ーー",
"ー・",
"ーーー",
"・ーー・",
"ーー・ー",
"・ー・",
"・・・",
"ー",
"・・ー",
"・・・ー",
"・ーー",
"ー・・ー",
"ー・ーー",
"ーー・・",
"ーーーーー",
"・ーーーー",
"・・ーーー",
"・・・ーー",
"・・・・ー",
"・・・・・",
"ー・・・・",
"ーー・・・",
"ーーー・・",
"ーーーー・"]
}
});
KlkETf3OcZASwrmrsYk4
*/
/*
await setDoc(doc(db, "posts", "KlkETf3OcZASwrmrsYk4"), {
  title: "原始関数集（ただしCは積分定数とする、ただしlogは自然対数とする）",
  subject: 1,
  good: 0,
  history: [],
  contents: {
    question: [
      "\\(\\int \\cos x\\, dx \\)",
      "\\(\\int \\sin x\\, dx\\)",
      "\\(\\int \\tan x\\, dx\\)",
      "\\(\\int \\frac{1}{x}\\, dx\\)",
      "\\(\\int \\arcsin x\\, dx\\)",
      "\\(\\int \\arccos x\\, dx\\)",
      "\\(\\int \\arctan x\\, dx\\)",
      "\\(\\int \\log x\\,dx\\)"
    ],
    answer: [
      "\\(\\sin x + C\\)",
      "\\(- \\cos x + C\\)",
      "\\(- \\log \\left| \\cos x \\right| + C\\)",
      "\\(\\log \\left| x \\right| + C\\)",
      "\\(x \\arcsin x + \\sqrt{1 - x^2} + C\\)",
      "\\(x \\arccos x - \\sqrt{1 - x^2} + C\\)",
      "\\(x \\arctan x - \\frac{1}{2}\\log(x^2 + 1) + C\\)",
      "\\(x \\log x - x + C\\)"
    ]
  }
});
*/
for (let i = 0; i < 3; i++) {
  document.getElementById(btns[i]).className = filterBtns[i] ? 'focus' : '';
  document.getElementById(btns[i]).addEventListener('click', () => {
    if (filterBtns[i]) {
      document.getElementById(btns[i]).classList.remove('focus');
    } else {
      document.getElementById(btns[i]).classList.add('focus');
      if (i === 1 && filterBtns[2]) {
        document.getElementById(btns[2]).classList.remove('focus');
        filterBtns[2] = false;
      } else if (i === 2 && filterBtns[1]) {
        document.getElementById(btns[1]).classList.remove('focus');
        filterBtns[1] = false;
      }
    }
    filterBtns[i] = !filterBtns[i];
    localStorage.setItem('setting', JSON.stringify(filterBtns));
    setContainers(judgeBtns(currentBoxes));
  });
}
document.getElementById('fixed-fil').addEventListener('click', () => {
  fixedFil = !fixedFil;
  if (fixedFil) {
    document.getElementById('fixed-fil').classList.add('focus');
  } else {
    document.getElementById('fixed-fil').classList.remove('focus');
  }
  setContainers(judgeBtns(currentBoxes));
});
// やばくなったら"ページネーション"
const querySnapshot = await getDocs(collection(db, "posts"));
querySnapshot.forEach((doc) => {
  if (doc.data().display == 'fixed') {
    Fixed.push({id: doc.id,title: doc.data().title, contents: doc.data().contents, subject: doc.data().subject, history: doc.data().history, good: doc.data().good ?? 0, display: 'fixed'});
    createContainer(doc.data(), doc.id);
  } else {
    Posts.push({id: doc.id,title: doc.data().title, contents: doc.data().contents, subject: doc.data().subject, history: doc.data().history, good: doc.data().good ?? 0, display: doc.data().display ?? 'normal'});
  }
});

function createContainer(docSnap, id) {
  const container = document.createElement('div');
  container.addEventListener('click', () => window.location.href = `test.html?f=user&id=${id}`);
  container.id = id;
  container.classList.add('container');
  container.innerHTML = docSnap.display == 'fixed' ? `
  <p class="subject" style="background-color: ${subjects[docSnap.subject ?? 10].color};">${subjects[docSnap.subject ?? 10].name}</p>
  <h2 class="title">${docSnap.title}</h2>
  <table class="contents">
    <tbody></tbody>
  </table>
  <p class="total"></p>
  
  </div>
  <p class="id">#${id}</p>
  ` : `
  <p class="subject" style="background-color: ${subjects[docSnap.subject ?? 10].color};">${subjects[docSnap.subject ?? 10].name}</p>
  <h2 class="title">${docSnap.title}</h2>
  <button type="button" id="edit-${id}" class="edit">
    <img src="assets/images/edit.svg" alt="編集のアイコン" class="image">
  </button>
  <table class="contents">
    <tbody></tbody>
  </table>
  <p class="total"></p>
  <button type="button" id="history-${id}" class="history">
    <img src="assets/images/history.svg" alt="履歴のアイコン" class="image">
  </button>
  
  <div class="good">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 star">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
    <p class="goodLabel">${docSnap.good}</p>
  </div>
  <p class="id">#${id}</p>
  `;
  main.appendChild(container);
  const star = container.getElementsByClassName('star')[0];
  const gLabel = container.getElementsByClassName('goodLabel')[0];
  if (favorites.includes(id)) {
    star.classList.add('filled');
  }

  if (docSnap.display == 'fixed') container.classList.add('fixed');
  else {
    star.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (isProcessing) return;
      isProcessing = true;
      const i = Posts.findIndex(i => i.id == id);
      if (favorites.includes(id)) {
        try {
          await updateDoc(doc(db, "posts", id), {
            good: increment(-1)
          });
          star.classList.remove('filled');
          Posts[i].good--;
          gLabel.textContent = String(Posts[i].good);
          favorites = favorites.filter(e => e != id);
        } catch(e) {
          console.error(e);
        }
      } else {
        try {
          await updateDoc(doc(db, "posts", id), {
            good: increment(1)
          });
          star.classList.add('filled');
          Posts[i].good++;
          gLabel.textContent = String(Posts[i].good);
          favorites.push(id);
        } catch(e) {
          console.error(e);
        }
      }
      isProcessing = false;
      localStorage.setItem('favorites', JSON.stringify(favorites));
    });
    const editBtn = document.getElementById(`edit-${id}`);
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let contents = [];
      for (let i = 0; i < docSnap.contents.question.length; i++) {
        contents.push([docSnap.contents.question[i], docSnap.contents.answer[i]]);
      }
      localStorage.setItem('edit', JSON.stringify({
        contents: contents,
        title: docSnap.title,
        subject: docSnap.subject,
        history: [id, ...(docSnap.history || [])]
      }));
      window.location.href = `make.html?c=edit`;
    });
    if (docSnap.history != undefined && docSnap.history.length != 0) {
      const btn = document.getElementById(`history-${id}`);
      btn.style.display = 'flex';
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        hisTbody.innerHTML = '';
        modal.style.display = 'flex';
        await Promise.all(docSnap.history.map(async item => {
          const i = Posts.findIndex(post => post.id == item);
          const newRow = hisTbody.insertRow(-1);
          const subCell = newRow.insertCell(0);
          const titleCell = newRow.insertCell(1);
          const idCell = newRow.insertCell(2);
          subCell.className = 'table-sub';
          titleCell.className = 'table-title';
          idCell.className = 'table-id';
          let subject = {};
          let title = "";
          let exist = true;
          subCell.style.width = '60px';
          if (i != -1) {
            subject = subjects[Posts[i].subject];
            title = Posts[i].title;
          } else {
            if (fin == false) {
              const itemDoc = await getDoc(doc(db, "posts", item));
              exist = itemDoc.exists();
              if (exist) {
                title = itemDoc.data().title;
                subject = subjects[itemDoc.data().subject];
              } else {
                newRow.className = 'not-available';
                subCell.innerHTML = `
                <p class="table-subject" style="background-color: #555;">不明</p>
                `;
                idCell.textContent = "既に削除されています。";
                titleCell.textContent = "この問題集は存在しません。";
              }
            } else {
              exist = false;
              newRow.className = 'not-available';
                subCell.innerHTML = `
                  <p class="table-subject" style="background-color: #555;">不明</p>
                `;
              idCell.textContent = "既に削除されています。";
              titleCell.textContent = "この問題集は存在しません。";
            }
          }
          if (exist) {
            newRow.className = 'available';
            subCell.innerHTML = `
              <p class="table-subject" style="background-color: ${subject.color};">
                ${subject.name}
              </p>
            `;
            idCell.textContent = "#" + item;
            titleCell.textContent = title;
            newRow.addEventListener('click', () => {
              window.location.href = `test.html?f=user&id=${item}`;
            });
          }
        }));
      });
    }
  }
  insertRows(docSnap.contents, id);
}
fin = true;
currentBoxes = [...Posts];
setContainers(judgeBtns(currentBoxes));

function insertRows(contents, targetID) {
  const target = document.getElementById(targetID);
  const tbody = target.getElementsByTagName('tbody')[0];
  const length = contents.question.length > 5 ? 5 : contents.question.length;
  for (let i = 0; i < length; i++) {
    const newRow = tbody.insertRow();
    const cell = newRow.insertCell(0);
    cell.innerHTML = contents.question[i];
    if (i == length - 1 && length < contents.question.length) {
      cell.classList.add('last');
    }
  }
  target.getElementsByClassName('total')[0].innerText = `全${contents.question.length}問`;
  target.getElementsByClassName('total')[0].style.display = 'block';
  target.classList.add('available');
}



function setContainers(users = false) {
  const unfixedContainers = document.querySelectorAll('div.container:not(.fixed)');
  for (const d of unfixedContainers) {
    main.removeChild(d);
  }
  if (users === false) {
    for (const element of Posts) {
      //usersがfalseのときは、全削除からの全追加
      createContainer(element, element.id);
    }
    return;
  }
  for (const element of users) {
    const createBox = Posts.filter((box) => box.id == element)[0];
    createContainer(createBox, createBox.id);
  }
  MathJax.typeset();
}

input.addEventListener('input', async () => {
  const value = input.value;
  if (value[0] == '#') {
    if (value.length == 1) return;
    const id = value.slice(1, value.length);
    setContainers([id]);
  } else if (value.length) {
    // valueにデータがある
    // titleから検索
    const titleHit = Posts
      .filter(box => box.title.toLowerCase().includes(value.toLowerCase()));
    currentBoxes = [...titleHit];
    setContainers(judgeBtns(titleHit));
  } else {
    currentBoxes = [...Posts];
    setContainers(judgeBtns(currentBoxes));
  }
});

function judgeBtns(arr = Posts) {
  for (const element of Fixed) {
    const fixedElem = document.getElementById(element.id);
    if (fixedFil) {
      if (!fixedElem) {
        createContainer(element, element.id);
      }
    } else {
      if (fixedElem) {
        main.removeChild(fixedElem);
      }
    }
    MathJax.typeset();
  }
  let data = [...arr];
  if (filterBtns[0]) {
    data = [...arr.filter(e => favorites.includes(e.id))];
  }
  if (filterBtns[1]) {
    data.sort((a, b) => b.good - a.good);
  } else if (filterBtns[2]) {
    data.sort((a, b) => a.subject - b.subject);
  } else if (!filterBtns[0]) {
    return arr.map(e => e.id);
  }

  return data.map(e => e.id);
}