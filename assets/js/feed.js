import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    doc,
    getDocs,
    getDoc,
    limit,
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
  {name: "その他", color: "#BA68C8"}];

const hisTbody = document.getElementById('his-tbody');
const modal = document.getElementById('modal');
const Posts = []; 
let fin = false;
// やばくなったら"ページネーション"
const querySnapshot = await getDocs(collection(db, "posts"));
querySnapshot.forEach((doc) => {
  Posts.push({id: doc.id,title: doc.data().title, contents: doc.data().contents, subject: doc.data().subject, history: doc.data().history});
  createContainer(doc.data(), doc.id);
});

function createContainer(docSnap, id) {
  const container = document.createElement('div');
  container.addEventListener('click', () => window.location.href = `test.html?f=user&id=${id}`);
  container.id = id;
  container.classList.add('container');
  container.innerHTML = `
  <p class="subject" style="background-color: ${subjects[docSnap.subject ?? 5].color};">${subjects[docSnap.subject ?? 5].name}</p>
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
  <p class="id">#${id}</p>
  `;

  main.appendChild(container);
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
    btn.style.display = 'block';
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
  
  insertRows(docSnap.contents, id);
}
fin = true;
function insertRows(contents, targetID) {
  const target = document.getElementById(targetID);
  const tbody = target.getElementsByTagName('tbody')[0];
  const length = contents.question.length > 5 ? 5 : contents.question.length;
  for (let i = 0; i < length; i++) {
    const newRow = tbody.insertRow();
    const cell = newRow.insertCell(0);
    cell.textContent = contents.question[i];
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
  let displayed = [];
  for (const d of unfixedContainers) {
    if (users !== false && users.includes(d.id))  {
      displayed.push(d.id);
      continue;
    }
    main.removeChild(d);
  }

  if (users === false) {
    for (const element of Posts) {
      //usersがfalseのときは、全削除からの全追加
      createContainer(element, element.id);
    }
  } else {
    for (const element of users) {
      if (displayed.includes(element)) continue;
      const createBox = Posts.filter((box) => box.id == element)[0];
      createContainer(createBox, createBox.id);
    }
  }
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
      .filter(box => box.title.toLowerCase().includes(value.toLowerCase()))
      .map(box => box.id);
    setContainers(titleHit);
  } else {
    setContainers();
  }
});