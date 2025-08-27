import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    getDocs,      // ← 追加
    doc,
    updateDoc,
    query,
    orderBy,
    getDoc,
    deleteDoc,
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

const subject = ["japanese", "math", "science", "social-studies", "english"];

let fileContents = [];
let files = []; 
let DOMs = [];
let data = {question: [], answer: []};
let selected = {};
function checkPass(p) {
    return ((((p << 3) * 3) + 500) ^ 1234567890) == 1431782166;
}
async function rec(structure, folderDoc, subject, parent) {
    for (const folderID of folderDoc.data().folders) {
        const folDoc = await getDoc(doc(db, "official", subject, "structure", folderID));
        const folS = {name: folDoc.data().title, type: "folder", children: []};
        const folDiv = document.createElement('li');
        folDiv.className = "folder";
        folDiv.textContent = folDoc.data().title;
        await rec(folS, folDoc, subject, folDiv);
        parent.appendChild(folDiv);
        structure.children.push(folS);
        DOMs.push(folDiv);
        folDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            DOMs.forEach(e => {
                e.style.backgroundColor = '';
                e.style.color = '';
            });
            selected.type = 'folder';
            selected.content = folDoc;
            folDiv.style.backgroundColor = '#2B9C2E';
            folDiv.style.color = 'white';
        });
        folDiv.addEventListener('contextmenu', e => {
            e.preventDefault();
            DOMs.forEach(e => {
                e.style.backgroundColor = '';
                e.style.color = '';
            });
            selected.type = 'folder';
            selected.content = folDoc;
            folDiv.style.backgroundColor = '#2B9C2E';
            document.getElementById('download').style.display = 'none';
            folDiv.style.color = 'white';
            document.getElementById('dialog').style.display = 'block';
        });
    }
    for (const fileID of folderDoc.data().files) {
        const fileDoc = files.docs[fileID];
        structure.children.push({name: fileDoc.data().title, type: "file", index: fileDoc.data().index});
        const fileSpan = document.createElement('ul');
        fileSpan.className = "file";
        fileSpan.textContent = `${fileDoc.data().title}, index: ${fileDoc.data().index}`;
        parent.appendChild(fileSpan);
        DOMs.push(fileSpan);
        fileSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            DOMs.forEach(e => {
                e.style.backgroundColor = '';
                e.style.color = '';
            });
            selected.type = 'file';
            selected.content = fileDoc;
            fileSpan.style.backgroundColor = '#2B9C2E';
            fileSpan.style.color = 'white';
        });
        fileSpan.addEventListener('contextmenu', e => {
            e.preventDefault();
            e.stopPropagation();
            DOMs.forEach(e => {
                e.style.backgroundColor = '';
                e.style.color = '';
            });
            selected.type = 'file';
            selected.content = fileDoc;
            fileSpan.style.backgroundColor = '#2B9C2E';
            document.getElementById('download').style.display = 'inline';
            fileSpan.style.color = 'white';
            document.getElementById('dialog').style.display = 'block';
        });
    }
}
document.getElementById('subject').addEventListener('change', async () => {
    await refresh();
});
async function choose(action) {
    if (action == 'cancel') { return document.getElementById('dialog').style.display = 'none'; }
    const p = parseInt(prompt("パスワードを入力", "0"));
    if (!isNaN(p) && checkPass(p)) {
        const v = parseInt(document.getElementById('subject').value);
        switch(action) {
            case 'delete':
                if (confirm(`本当に  ${selected.content.data().title} ${selected.type == 'file' ? "ファイル" : "フォルダ"}  を削除しますか？`)) {
                    if (selected.type == 'file') {
                        await deleteDoc(doc(db, "official", subject[v], "contents", selected.content.id));
                        const folderDocs = await getDocs(collection(db, "official", subject[v], "structure"));
                        folderDocs.forEach(async (folderDoc) => {
                            if (folderDoc.data().files.includes(selected.content.data().index)) {
                                const newFiles = folderDoc.data().files
                                    .filter(index => index !== selected.content.data().index) // 削除
                                    .map(index => index > selected.content.data().index ? index - 1 : index);
                                await updateDoc(doc(db, "official", subject[v], "structure", folderDoc.id), {
                                    files: newFiles
                                });
                            }
                        });
                        const fileDocs = await getDocs(query(collection(db, "official", subject[v], "contents"), orderBy("index")));
                        let deleteIndex = selected.content.data().index;
                        fileDocs.forEach(async (fileDoc) => {
                            if (fileDoc.data().index > deleteIndex) {
                                await updateDoc(doc(db, "official", subject[v], "contents", fileDoc.id), {
                                    index: fileDoc.data().index - 1
                                });
                            }
                        });
                    } else if (selected.type == 'folder') {
                        if (selected.content.id == 'root') {
                            alert("rootフォルダーは削除できません");
                            break;
                        }
                        const folderDocs = await getDocs(collection(db, "official", subject[v], "structure"));
                        folderDocs.forEach(async (folderDoc) => {
                            if (folderDoc.data().folders.includes(selected.content.id)) {
                                const newFolders = folderDoc.data().folders.filter(id => id !== selected.content.id);
                                await updateDoc(doc(db, "official", subject[v], "structure", folderDoc.id), {
                                    folders: newFolders
                                });
                            }
                        });
                        await deleteDoc(doc(db, "official", subject[v], "structure", selected.content.id));
                    }
                    document.getElementById('dialog').style.display = 'none';
                    await refresh();
                    selected = {};
                }
                break;
            case 'change':
                const newName = prompt("新しい名前を入力", "");
                if (newName != null && newName.trim() !== '') {
                    if (selected.type == 'file') {
                        await updateDoc(doc(db, "official", subject[v], "contents", selected.content.id), {
                            title: newName
                        });
                    } else if (selected.type == 'folder') {
                        await updateDoc(doc(db, "official", subject[v], "structure", selected.content.id), {
                            title: newName
                        });
                    }
                    document.getElementById('dialog').style.display = 'none';
                    await refresh();
                    selected = {};
                }
                break;
            case 'download':
                document.getElementById('unitName').value = selected.content.data().title;
                fileContents = [];
                document.getElementById('tbody').innerHTML = '';
                for (let i = 0; i < selected.content.data().contents.question.length; i++) {
                    const q = selected.content.data().contents.question[i];
                    const a = selected.content.data().contents.answer[i];
                    fileContents.push([q.text, a.text]);
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
                    queCell.innerHTML = q.text;
                    queCell.appendChild(queDiv);
                    ansCell.innerHTML = a.text;
                    ansCell.appendChild(ansDiv);
                    q.images.forEach(url => {
                        const img = document.createElement('img');
                        img.src = url;
                        img.style.maxWidth = '100px';
                        img.style.marginRight = '5px';
                        quePreview.appendChild(img);
                    });
                    a.images.forEach(url => {   
                        const img = document.createElement('img');
                        img.src = url;
                        img.style.maxWidth = '100px';
                        img.style.marginRight = '5px';
                        ansPreview.appendChild(img);
                    });
                }
                break;
        }
    } else {
        alert("パスワードが違います。");
    }
    document.getElementById('dialog').style.display = 'none';
}
async function refresh() {
    document.getElementById('structure').innerHTML = '';
    files = [];
    DOMs = [];
    const v = parseInt(document.getElementById('subject').value);
    files = await getDocs(query(collection(db, "official", subject[v], "contents"), orderBy("index")));
    const root = await getDoc(doc(db, "official", subject[v], "structure", "root"));
    const structure = {
        name: "root",
        type: "folder",
        children: []
    };
    const rootDiv = document.createElement('li');
    rootDiv.textContent = "root";
    rootDiv.className = "folder";
    rootDiv.addEventListener('click', () => {
        selected.type = 'folder';
        selected.content = root;
        rootDiv.style.backgroundColor = '#2B9C2E';
        rootDiv.style.color = 'white';
    });
    document.getElementById('structure').appendChild(rootDiv);
    DOMs.push(rootDiv);
    await rec(structure, root, subject[v], rootDiv);
}
document.getElementById('myForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (selected.type == undefined) {
        alert("ファイルかフォルダーを選んでね");
        return;
    }
    const p = parseInt(prompt("パスワードを入力", "0"));
    if (!isNaN(p) && checkPass(p)) {
        data = {question: [], answer: []}; 
        document.getElementById('progress').textContent = 'データを調べています';
        const hoge = await getDocs(collection(db, 'official', subject[parseInt(document.getElementById('subject').value)], 'contents'));
        let count = 0;
        const trs = document.querySelectorAll('tbody tr');
        for (let i = 0; i < trs.length; i++) {
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
        const v = parseInt(document.getElementById('subject').value);
        if (selected.type == "file") {
            await updateDoc(doc(db, "official", subject[v], "contents", selected.content.id), {
                title: document.getElementById('unitName').value,
                contents: data
            });
        } else {
            await addDoc(collection(db, 'official', subject[v], 'contents'), {
                title: document.getElementById('unitName').value,
                contents: data,
                index: hoge.size
            });
            await updateDoc(doc(db, "official", subject[v], "structure", selected.content.id), {
                files: [...selected.content.data().files, hoge.size]
            });
        }
        await refresh();
        selected = {};
        document.getElementById('progress').textContent = 'だん！';
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

  window.choose = choose;