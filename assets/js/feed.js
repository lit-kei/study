import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    getDocs,
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

const Posts = [];
/*await addDoc(collection(db, "posts"), {
  contents: {
    question: ["私は誰でしょう"],
    answer: ["卑弥呼"]
  },
  title: "歴史（簡単）"
});*/
// やばくなったら"ページネーション"
const querySnapshot = await getDocs(collection(db, "posts"));
querySnapshot.forEach((doc) => {
  Posts.push({id: doc.id,title: doc.data().title, contents: doc.data().contents});
  createContainer(doc.data(), doc.id);
});

function createContainer(docSnap, id) {
  const container = document.createElement('div');
  container.id = id;
  container.classList.add('container');
  container.addEventListener('click', () => window.location.href = `test.html?f=user&id=${id}`);
  const title = document.createElement('h2');
  title.classList.add('title');
  title.innerText = docSnap.title;
  container.appendChild(title);
  const table = document.createElement('table');
  table.classList.add('contents');
  table.appendChild(document.createElement('tbody'));
  container.appendChild(table);
  const total = document.createElement('p');
  total.classList.add('total');
  container.appendChild(total);
  const identifier = document.createElement('p');
  identifier.textContent = '#' + id;
  identifier.classList.add('id');
  container.appendChild(identifier);

  main.appendChild(container);

  
  insertRows(docSnap.contents, id);
}
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