import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCC4HW_rNFZHhhH1OzovE9coc_TRlKYJ4I",
  authDomain: "study-1105a.firebaseapp.com",
  projectId: "study-1105a",
  storageBucket: "study-1105a.firebasestorage.app",
  messagingSenderId: "356676590589",
  appId: "1:356676590589:web:cd449cd5ac74e6db449794",
  measurementId: "G-P84CG30Z7N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById('feedback-form');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const name = formData.get('name') || "匿名";
  const message = formData.get('message');

  try {
    await addDoc(collection(db, 'feedbacks'), {
      name,
      message,
      createdAt: serverTimestamp(),
    });
    status.textContent = "フィードバックを送信しました。ありがとうございます！";
    form.reset();
  } catch (error) {
    status.textContent = "送信に失敗しました。時間を置いてもう一度お試しください。";
    console.error(error);
  }
});

const accordions = document.querySelectorAll('.accordion');
const panels = document.querySelectorAll('.panel');

accordions.forEach((accordion, index) => {
  const panel = panels[index];

  accordion.addEventListener('click', () => {
    const isOpen = accordion.classList.contains('open');

    // 切り替え
    accordion.classList.toggle('open');

    // 高さ設定（scrollHeightを使ってスムーズに）
    if (isOpen) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});