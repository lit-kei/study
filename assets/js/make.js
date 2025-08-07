import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    getDocs,      // ← 追加
    updateDoc,    // ← 追加
    Timestamp,
    doc  } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dl7n5gvgh/image/upload";
const UPLOAD_PRESET = "studyImages";

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


const subjects = ["kokugo", "sugaku", "rika", "shakai", "eigo","ongaku", "kateika", "gijutsu", "bijutsu", "hotai", "others"];
const params = new URLSearchParams(window.location.search);

const modal = document.getElementById('modal');
const toast = document.getElementById('saveToast');

const isMac = navigator.userAgent.includes('Macintosh');

let index = 0;
let id = '';
let histories = [];
let timeoutId;

function addRow({ i = -1, q = "", a = "" } = {}) {
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
  const queAdd = document.createElement('input');
  const ansAdd = document.createElement('input');
  const queImagePreview = document.createElement('div');
  queImagePreview.className = 'image-preview';
  const ansImagePreview = document.createElement('div');
  ansImagePreview.className = 'image-preview';
  queAdd.type = 'file';
  ansAdd.type = 'file';
  queAdd.className = 'qFile';
  ansAdd.className = 'aFile';
  queAdd.accept = 'image/*';
  ansAdd.accept = 'image/*';
  queAdd.multiple = true;
  ansAdd.multiple = true;
  queAdd.tabIndex = -1;
  ansAdd.tabIndex = -1;
  queAdd.addEventListener('change', () => {
    queImagePreview.innerHTML = '';
    Array.from(queAdd.files).forEach(file => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = '100px';
      img.style.marginRight = '5px';
      queImagePreview.appendChild(img);
    });
  });
  ansAdd.addEventListener('change', () => {
    ansImagePreview.innerHTML = '';
    Array.from(ansAdd.files).forEach(file => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = '100px';
      img.style.marginRight = '5px';
      ansImagePreview.appendChild(img);
    });
  });

  que.required = true;
  ans.required = true;
  que.className = 'question';
  ans.className = 'answer';
  que.name = "question";
  ans.name = "answer";
  que.value = q;
  ans.value = a;
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
  queCell.appendChild(queAdd);
  ansCell.appendChild(ansAdd);
  queCell.appendChild(queImagePreview);
  ansCell.appendChild(ansImagePreview);
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
    addRow({i: i});
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
  window.scrollBy(0, 62);
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
  const val = isNaN(Number(document.getElementById('subject').value)) ? 10 : Number(document.getElementById('subject').value);
  document.getElementById('subject').className = subjects[val];
});

document.getElementById('mainForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (index == 0) {
    alert('1つ以上の問題と答えをセットしてください。')
  } else {
    let text = "";
    let dots = "";
    let count = 0;
    const interval = setInterval(() => {
      dots += ".";
      if (dots.length >= 4) dots = "";
      document.getElementById('label').innerHTML = `${text}<span style="font-size: 25px">${dots}</span>`;
    }, 300);
    modal.style.display = 'flex';
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('idLabel').style.display = 'none';
    document.getElementById('idLabel').textContent = '';

    const title = document.getElementById('title').value;
    const subject = isNaN(Number(document.getElementById('subject').value)) ? 10 : Number(document.getElementById('subject').value);
    const trs = document.querySelectorAll('tbody tr');
    let question = [];
    let answer = [];
    let totalImageCount = 0;
    trs.forEach(tr => {
      totalImageCount += tr.querySelector('input.qFile').files.length;
      
      totalImageCount += tr.querySelector('input.aFile').files.length;
    });
    for (let i = 0; i < trs.length; i++) {
      const e = trs[i];
      const qText = e.getElementsByClassName('question')[0].value;
      const aText = e.getElementsByClassName('answer')[0].value;
      const qImages = e.querySelector('input.qFile').files;
      const aImages = e.querySelector('input.aFile').files;
    
      const qImageURLs = [];
      const aImageURLs = [];
    
      for (let file of qImages) {
        console.log("que");
        count++;
        text = `${count} / ${totalImageCount}の画像を処理中`;
        const url = await uploadToCloudinary(file);
        qImageURLs.push(url);
      }
      for (let file of aImages) {
        console.log("ans");
        count++;
        text = `${count} / ${totalImageCount}の画像を処理中`;
        const url = await uploadToCloudinary(file);
        aImageURLs.push(url);
      }
    
      question.push({
        text: qText,
        images: qImageURLs,
      });
      answer.push({
        text: aText,
        images: aImageURLs,
      });
    }
    
    await addDoc(collection(db, "posts"), {
      title: title,
      subject: subject,
      contents: {
        question: question,
        answer: answer
      },
      history: histories,
      good: 0,
      createdAt: Timestamp.now()
    }).then(ref => {
        clearInterval(interval);
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
  switch (params.get('c')) {
    case "edit":
      const data = JSON.parse(localStorage.getItem('edit'));
      document.getElementById('title').value = data.title;
      document.getElementById('subject').value = data.subject;
      document.getElementById('subject').className = subjects[data.subject];
      for (let i = 0; i < data.contents.length; i++) {
        addRow({q: data.contents[i][0], a: data.contents[i][1]});
      }
      histories = [...data.history];
      break;
  
    default:
      const saveData = JSON.parse(localStorage.getItem('save'));
      if (saveData != null) {
        const result = confirm("保存したデータを読み込みますか？");
        document.getElementById('delete').style.display = 'block';
        if (result) {
            document.getElementById('title').value = saveData.title;
            document.getElementById('subject').value = saveData.subject;
            document.getElementById('subject').className = subjects[saveData.subject];
            for (let i = 0; i < saveData.contents.length; i++) {
              addRow({q: saveData.contents[i][0], a: saveData.contents[i][1]});
            }
            histories = [...saveData.history];
          break;
        }
      }

      addRow();
      break;
  }
  document.getElementById('addRowBtn').innerHTML = isMac ? '+' : '+<span style="font-size: 20px;">(Enter)</span>';
  window.addRow = addRow;
  window.back = back;
  window.run = run;
  document.getElementById('save').addEventListener('click', save);
  document.getElementById('delete').addEventListener('click', () => {
    const check = confirm('本当に削除しますか？');
    if (check) {
      localStorage.removeItem("save");
      document.getElementById('delete').style.display = 'none';
      toast.textContent = '削除しました！';
      toast.style.backgroundColor = '#e23a3aff';
      toast.classList.add('show');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast.classList.remove('show');
      }, 1000);
    } else {
      toast.textContent = '削除に失敗しました';
      toast.style.backgroundColor = '#a2af2bff';
      toast.classList.add('show');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast.classList.remove('show');
      }, 1000);
    }
  });
});


function save() {
  let saveContents = [];
  const trs = document.querySelectorAll('tbody tr');
  for (let i = 0; i < trs.length; i++) {
    const e = trs[i];
    saveContents.push([e.getElementsByClassName('question')[0].value, e.getElementsByClassName('answer')[0].value]);
  }
  localStorage.setItem('save', JSON.stringify({
    title: document.getElementById('title').value,
    subject: document.getElementById('subject').value,
    modification: params.get('c') == "edit",
    contents: saveContents,
    history: histories
  }));
  document.getElementById('delete').style.display = 'block';

  toast.textContent = '保存しました！';
  toast.style.backgroundColor = '#4caf4f';
  toast.classList.add('show');

  timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 1000);
}

function back() {
  window.location.href = 'feed.html';
}

function run() {
  window.location.href = `test.html?f=user&id=${id}`;
}

window.addEventListener('keydown', e => {
  if (e.key == 'Enter' && !isMac) {
    addRow();
  }
});

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null; // もしくは null を返してスキップしても良い
  }
}
