import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    updateDoc,
    doc,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    increment} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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
let filterBtns = JSON.parse(localStorage.getItem('setting')) ?? [false, false, false, false];
if (filterBtns.length == 3) {
  filterBtns.push(false);
  localStorage.setItem('setting', JSON.stringify(filterBtns));
}
let fixedFil = true;
let currentBoxes = [];
const btns = ["favorite-fil", "good-fil", "subject-fil", "createdAt-fil"];
let fin = false;
let isProcessing = false;
let favorites = JSON.parse(localStorage.getItem('favorites'));
if (favorites === null) { 
  favorites = [];
  localStorage.setItem('favorites', JSON.stringify([]));
}
/*
await getDoc(doc(db, "posts", "gSCwhgTA5RWuieGWqFM7")).then(async docS => {
  const data = docS.data();
  await setDoc(doc(db, "posts", "1SCwhgTA5RWuieGWqFM7"), {
    title: data.title,
    subject: 1,
    good: 1,
    history: [],
    contents: {
      question: data.contents.question,
      answer: data.contents.answer
    }
  });
});*/
/*
await addDoc(collection(db, "posts"), {
  title: "学問の英語集",
  subject: 4,
  good: 0,
  history: [],
  //display: "fixed",
  contents: {
  question: ["生命倫理学","経済学","電子工学","倫理学","人間工学","遺伝学","老人病学","言語学","数学","機械学、力学","産科学","小児科学","言語心理学","物理学","音韻学","発音学（音声学）","統計学","人類学","考古学","生物学","生命工学（生物工学）","生態学","地質学","婦人科学","気象学","神話学","文献学","音韻論","生理学","地震学","社会学","神学","動物学","会計学","代数学","分析学","解剖学","美学","天文学","植物学","化学","土木工学","商業学","民俗学","地理学","幾何学","歴史学","法学","文学","論理学","金属工学、冶（や）金学","教育学","哲学","政治学"],
  answer: ["bioethics","economics","electronics","ethics","ergonomics","genetics","geriatrics","linguistics","mathematics","mechanics","obstetrics","pediatrics","psycholinguistics","physics","phonemics","phonetics","statistics","anthropology","archaeology","biology","biotechnology","ecology","geology","gynecology","meteorology","mythology","philology","phonology","physiology","seismology","sociology","theology","zoology","accounting","algebra","analysis","anatomy","art","astronomy","botany","chemistry","civil engineering","commerce","folklore","geography","geometry","history","jurisprudence","literature","logic","metallurgy","pedagogy","philosophy","politics"]
}
});*/

for (let i = 0; i < 4; i++) {
  document.getElementById(btns[i]).className = filterBtns[i] ? 'focus' : '';
  document.getElementById(btns[i]).addEventListener('click', () => {
    if (filterBtns[i]) {
      document.getElementById(btns[i]).classList.remove('focus');
    } else {
      document.getElementById(btns[i]).classList.add('focus');
      if (i === 1) {
        document.getElementById(btns[2]).classList.remove('focus');
        filterBtns[2] = false;
        document.getElementById(btns[3]).classList.remove('focus');
        filterBtns[3] = false;
      } else if (i === 2) {
        document.getElementById(btns[1]).classList.remove('focus');
        filterBtns[1] = false;
        document.getElementById(btns[3]).classList.remove('focus');
        filterBtns[3] = false;
      } else if (i === 3) {
        document.getElementById(btns[1]).classList.remove('focus');
        filterBtns[1] = false;
        document.getElementById(btns[2]).classList.remove('focus');
        filterBtns[2] = false;

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
    Fixed.push({id: doc.id,title: doc.data().title, contents: doc.data().contents, subject: doc.data().subject, display: 'fixed'});
    createContainer(doc.data(), doc.id);
  } else {
    Posts.push({id: doc.id,title: doc.data().title, contents: doc.data().contents, subject: doc.data().subject, history: doc.data().history, good: doc.data().good ?? 0, display: doc.data().display ?? 'normal', createdAt: doc.data().createdAt});
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
        contents.push([docSnap.contents.question[i].text, docSnap.contents.answer[i].text]);
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
  container.style.animationDelay = `${Math.random() * 0.4}s`;
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
    cell.innerHTML = contents.question[i].text;
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
  } else if (filterBtns[3]) {
    data.sort((a, b) => b.createdAt - a.createdAt);
  } else if (!filterBtns[0]) {
    return arr.map(e => e.id);
  }

  return data.map(e => e.id);
}