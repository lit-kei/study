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

const subjects = ["kokugo", "sugaku", "rika", "shakai", "eigo", "others"];

const modal = document.getElementById('modal');

let index = 0;
let id = '';

function addRow(i = -1) {
  index++;
  const table = document.getElementById("mainTable");
  
  const newRow = table.querySelector("tbody").insertRow(i); // -1 は最後に挿入

  const idCell = newRow.insertCell(0);
  const queCell = newRow.insertCell(1);
  const ansCell = newRow.insertCell(2);
  const btnCell = newRow.insertCell(3);

  idCell.className = 'id';

  queCell.classList.add('que');
  ansCell.classList.add('ans');

  const que = document.createElement('textarea');
  const ans = document.createElement('textarea');

  que.required = true;
  ans.required = true;
  que.className = 'question';
  ans.className = 'answer';
  que.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
      e.preventDefault();
    }
  });
  ans.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
      e.preventDefault();
    }
  });
  queCell.appendChild(que);
  ansCell.appendChild(ans);
  const dropBtn = document.createElement('button');
  dropBtn.type = 'button';
  dropBtn.className = 'dropBtn';
  dropBtn.innerHTML = '&#x22ee;';
  btnCell.className = 'last';
  btnCell.appendChild(dropBtn);
  idCell.textContent = String(index);

  const drop = document.createElement('div');
  drop.className = 'menu';
  const insertBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');
  insertBtn.textContent = '上に行を挿入';
  deleteBtn.textContent = 'この行を削除';
  insertBtn.type = 'button';
  deleteBtn.type = 'button';
  insertBtn.className = 'insert';
  deleteBtn.className = 'delete';
  insertBtn.addEventListener('click', () => {
    const tbody = newRow.parentElement;
    const i = Array.from(tbody.rows).indexOf(newRow); // tbody内のインデックス（0始まり）
    addRow(i);
    reset();
  });
  deleteBtn.addEventListener('click', () => {
    newRow.remove();
    index--;
    reset();
  });
  drop.appendChild(insertBtn);
  drop.appendChild(deleteBtn);

  btnCell.appendChild(drop);
  newRow.getElementsByTagName('textarea')[0].focus();
}
function reset() {
  const tds = document.getElementsByClassName('id');
  for (let i = 0; i < tds.length; i++) {
    const e = tds[i];
    const origin = e.textContent;
    if (i + 1 != origin) {
      e.textContent = String(i + 1);
      e.style.color = '#f60';
      setTimeout(() => e.style.color = '', 300);
    }
  }
}

document.addEventListener("click", function (e) {
    const allMenus = document.querySelectorAll(".menu");
    const isDropBtn = e.target.classList.contains("dropBtn");

    // メニューを一旦全部閉じる
    allMenus.forEach(menu => menu.classList.remove("show"));

    if (isDropBtn) {
        const menu = e.target.nextElementSibling;
        menu.classList.toggle("show");
        e.stopPropagation(); // 他のクリックイベントを止める
    }
});

document.getElementById('subject').addEventListener('change', () => {
  const val = isNaN(Number(document.getElementById('subject').value)) ? 5 : Number(document.getElementById('subject').value);
  document.getElementById('subject').className = subjects[val];
});

document.getElementById('mainForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (index == 0) {
    alert('1つ以上の問題と答えをセットしてください。')
  } else {
    const title = document.getElementById('title').value;
    const subject = isNaN(Number(document.getElementById('subject').value)) ? 5 : Number(document.getElementById('subject').value);
    const trs = document.querySelectorAll('tbody tr');
    let question = [];
    let answer = [];
    for (let i = 0; i < trs.length; i++) {
      const e = trs[i];
      question.push(e.getElementsByClassName('question')[0].value);
      answer.push(e.getElementsByClassName('answer')[0].value);
    }
    modal.style.display = 'flex';
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('label').textContent = '投稿しています。少々お待ちください。';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('idLabel').style.display = 'none';
    document.getElementById('idLabel').textContent = '';
    await addDoc(collection(db, "posts"), {
      title: title,
      subject: subject,
      contents: {
        question: question,
        answer: answer
      }
    }).then(ref => {
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('label').textContent = '投稿しました。問題集のIDを表示します。';
        document.getElementById('buttons').style.display = 'flex';
        document.getElementById('idLabel').style.display = 'block';
        id = ref.id;
        document.getElementById('idLabel').textContent = `#${id}`;
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  addRow();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addRow();
  }
});

window.addRow = addRow;

function back() {
  modal.style.display = 'none';
}

function run() {
  window.location.href = `test.html?f=user&id=${id}`;
}

window.back = back;
window.run = run;