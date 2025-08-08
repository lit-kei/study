import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    getDocs,      // ← 追加
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

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dl7n5gvgh/image/upload";
const UPLOAD_PRESET = "studyImages";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const subject = ["japanese", "math", "social-studies", "science", "english"];

let fileContents = [];
let data = {question: [], answer: []};

document.getElementById('myForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const p = parseInt(prompt("パスワードを入力", "0"));
    if (!isNaN(p) && ((((p << 3) * 3) + 500) ^ 1234567890) == 1431782166) {
        data = {question: [], answer: []}; 
        document.getElementById('progress').textContent = 'データを調べています';
        let index = document.getElementById('unit').value;
        const hoge = await getDocs(collection(db, 'official', subject[parseInt(document.getElementById('subject').value)], 'contents'));
        let count = 0;
        const trs = document.querySelectorAll('tbody tr');
        for (let i = 0; i < trs.length; i++) {
            console.log(i);
            const tr = trs[i];
            const tds = tr.getElementsByTagName('td');
            const queImages = tds[1].getElementsByTagName('input')[0].files;
            let queUrls = [];
            for (const file of queImages) {
                count++;
                document.getElementById('progress').textContent = `${count}枚目の画像を処理中`;
                const url = await uploadToCloudinary(file);
                queUrls.push(url);
            }
            data.question.push({text: fileContents[i][0], images: queUrls});
            const ansImages = tds[2].getElementsByTagName('input')[0].files;
            let ansUrls = [];
            for (const file of ansImages) {
                count++;
                document.getElementById('progress').textContent = `${count}枚目の画像を処理中`;
                const url = await uploadToCloudinary(file);
                ansUrls.push(url);
            }
            data.answer.push({text: fileContents[i][1], images: ansUrls});
            document.getElementById('progress').textContent = 'だん！';
        }
        
        if (index == "") {
            await addDoc(collection(db, 'official', subject[parseInt(document.getElementById('subject').value)], 'contents'), {
                title: document.getElementById('unitName').value,
                contents: data,
                index: hoge.size
            });
        } else {
            index = parseInt(index);
            if (index >= hoge.size) {
                await addDoc(collection(db, 'official', subject[parseInt(document.getElementById('subject').value)], 'contents'), {
                    title: document.getElementById('unitName').value,
                    contents: data,
                    index: index
                });
            } else {
                const target = hoge.docs.find(e => e.data().index == index);
                await setDoc(doc(db, 'official', subject[parseInt(document.getElementById('subject').value)], 'contents', target.id), {
                    title: document.getElementById('unitName').value,
                    contents: data
                }, { merge: true });
            }
        }
    } else {
        alert("パスワードが違います。");
    }
});

document.getElementById('file').addEventListener('change', () => {
    const tbody = document.getElementById('tbody');
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    if (document.getElementById('file').files.length > 0) {
        const file = document.getElementById('file').files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            try {
                fileContents = JSON.parse(fileContent);
                if (fileContents.shuffle != undefined) {
                    fileContents = [...fileContents.contents];
                }
                for (let i = 0; i < fileContents.length; i++) {
                    const e = fileContents[i];
                    const newRow = document.getElementById('tbody').insertRow();
                    const idCell = newRow.insertCell();
                    const queCell = newRow.insertCell();
                    const ansCell = newRow.insertCell();
                    idCell.textContent = String(i);
                    const queImages = document.createElement('input');
                    const ansImages = document.createElement('input');
                    queImages.multiple = true;
                    ansImages.multiple = true;
                    queImages.type = 'file';
                    ansImages.type = 'file';
                    queImages.accept = 'image/*';
                    ansImages.accept = 'image/*';
                    const queDiv = document.createElement('div');
                    const ansDiv = document.createElement('div');
                    queDiv.appendChild(queImages);
                    ansDiv.appendChild(ansImages);
                    const quePreview = document.createElement('div');
                    const ansPreview = document.createElement('div');
                    queDiv.appendChild(quePreview);
                    ansDiv.appendChild(ansPreview);
                    queImages.addEventListener('change', () => {
                        quePreview.innerHTML = '';
                        Array.from(queImages.files).forEach(file => {
                          const img = document.createElement('img');
                          img.src = URL.createObjectURL(file);
                          img.style.maxWidth = '100px';
                          img.style.marginRight = '5px';
                          quePreview.appendChild(img);
                        });
                    });
                    ansImages.addEventListener('change', () => {
                        ansPreview.innerHTML = '';
                        Array.from(ansImages.files).forEach(file => {
                          const img = document.createElement('img');
                          img.src = URL.createObjectURL(file);
                          img.style.maxWidth = '100px';
                          img.style.marginRight = '5px';
                          ansPreview.appendChild(img);
                        });
                    });
                    queCell.innerHTML = e[0];
                    queCell.appendChild(queDiv);
                    ansCell.innerHTML = e[1];
                    ansCell.appendChild(ansDiv);
                    
                }
            } catch {
                console.error('ファイルデータがJSONとしてパースできません。');
            }
        }
        reader.readAsText(file);
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