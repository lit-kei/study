import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    initializeFirestore,
    CACHE_SIZE_UNLIMITED,
    collection, 
    doc,
    getDocs,
    getDoc,
    where,
    limit,
    query,
    orderBy,
    updateDoc,
    startAt,
    endAt,
    startAfter,
    setDoc,
    addDoc,
    Timestamp,
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
const db = initializeFirestore(app, {
  localCache: {
    memory: true,        // メモリキャッシュ
    persistence: true,   // IndexedDBによる永続キャッシュ
    cacheSizeBytes: CACHE_SIZE_UNLIMITED, // キャッシュサイズの上限
  }
});

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

let loadMore = false;

let Posts = []; 
let originalData = [];
let Fixed = [];
let sort = "unsorted";
let filterBtns = JSON.parse(localStorage.getItem('setting')) ?? [false, false, false, false];
if (filterBtns.length == 3) {
  filterBtns.push(false);
  localStorage.setItem('setting', JSON.stringify(filterBtns));
}
let fixedFil = true;
let currentBoxes = [];
const btns = ["favorite-fil", "good-fil", "subject-fil", "createdAt-fil"];
const sorts = ["good", "subject", "createdAt"];
let fin = false;
let isProcessing = false;
let favorites = JSON.parse(localStorage.getItem('favorites'));
if (favorites === null) { 
  favorites = [];
  localStorage.setItem('favorites', JSON.stringify([]));
} else {
  favorites.sort();
}

// 最初の取得
let lastDoc = null;

for (let i = 0; i < 4; i++) {
  if (filterBtns[i]) {
    document.getElementById(btns[i]).className = 'focus';
    if (i >= 1) sort = sorts[i - 1];
  } else {
    document.getElementById(btns[i]).className = '';
  }
  document.getElementById(btns[i]).addEventListener('click', async () => {
    lastDoc = null;
    if (filterBtns[i]) {
      if (i != 0) sort = "unsorted";
      document.getElementById(btns[i]).classList.remove('focus');
    } else {
      document.getElementById(btns[i]).classList.add('focus');
      if (i === 1) {
        sort = 'good';
        document.getElementById(btns[2]).classList.remove('focus');
        filterBtns[2] = false;
        document.getElementById(btns[3]).classList.remove('focus');
        filterBtns[3] = false;
      } else if (i === 2) {
        sort = 'subject';
        document.getElementById(btns[1]).classList.remove('focus');
        filterBtns[1] = false;
        document.getElementById(btns[3]).classList.remove('focus');
        filterBtns[3] = false;
      } else if (i === 3) {
        sort = 'createdAt';
        document.getElementById(btns[1]).classList.remove('focus');
        filterBtns[1] = false;
        document.getElementById(btns[2]).classList.remove('focus');
        filterBtns[2] = false;

      }
    }
    filterBtns[i] = !filterBtns[i];
    if (document.getElementById('input').value.length == 0 || 
       (document.getElementById('input').value.length == 1 && document.getElementById('input').value[0] == "#")) {
      document.getElementById('search-modal').style.display = 'block';
      localStorage.setItem('setting', JSON.stringify(filterBtns));
      currentBoxes = [...(await fetchPosts())];
      originalData = [...currentBoxes];
      currentBoxes.forEach(doc => {
        Posts.push({...doc});
      });
      Posts = [...Posts];
      document.getElementById('search-modal').style.display = 'none';
      setContainers(judgeBtns(currentBoxes), loadMore);
    } else {
      setContainers(sortData(currentBoxes), loadMore);
    }
  });
}
document.getElementById('fixed-fil').addEventListener('click', async () => {
  fixedFil = !fixedFil;
  if (fixedFil) {
    document.getElementById('fixed-fil').classList.add('focus');
  } else {
    document.getElementById('fixed-fil').classList.remove('focus');
  }
  setContainers(judgeBtns(currentBoxes), loadMore);
});
document.getElementById('search-modal').style.display = 'block';
const firstFrgment = document.createDocumentFragment();
const fixedSnapshot = await getDocs(query(collection(db, "posts"), where("display", "==", "fixed")));
fixedSnapshot.forEach(doc => {
    Fixed.push({id: doc.id, ...doc.data()});
    createContainer(doc.data(), doc.id, firstFrgment);
});

//const querySnapshot = await getDocs(query(collection(db, "posts"), where("display", "==", "normal"), orderBy("display")));
const querySnapshot = await fetchPosts();
querySnapshot.forEach((doc) => {
  Posts.push({...doc});
});


async function fetchPosts(limitCount = 20) {
  loadMore = false;
  if (filterBtns[0] === true) {
    const favoriteSnapshots = await Promise.all(
      favorites.map(favorite => getDoc(doc(db, "posts", favorite)))
    );
    const sortedFavoriteSnapshots = sortData(favoriteSnapshots.map(e => ({ id: e.id, ...e.data()})));
    originalData = [...sortedFavoriteSnapshots];
    return sortedFavoriteSnapshots;
  }
  let q;
  let sortQuery;
  switch (sort) {
    case "unsorted":
      sortQuery = orderBy("display", "asc");
      break;
    case "subject":
      sortQuery = orderBy('subject', "asc");
      break;
    default:
      sortQuery = orderBy(sort, "desc");
      break;
  }
  if (lastDoc) {
    q = query(
      collection(db, "posts"),
      where("display", "==", "normal"),
      sortQuery,
      startAfter(lastDoc),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, "posts"),
      where("display", "==", "normal"),
      sortQuery,
      limit(limitCount)
    );
  }
  const snapshot = await getDocs(q);
  if (snapshot.docs.length > 0) {
    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }
  if (snapshot.docs.length == limitCount) loadMore = true;
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function createContainer(docSnap, id, fragment = false) {
  const container = document.createElement('div');
  container.addEventListener('click', () => window.location.href = `/study/test.html?f=user&id=${id}`);
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
  if (fragment === false) {
    main.appendChild(container);
  } else {
    fragment.appendChild(container);
  }
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
          favorites.sort();
        } catch(e) {
          console.error(e);
        }
      }
      isProcessing = false;
      localStorage.setItem('favorites', JSON.stringify(favorites));
    });
    const editBtn = fragment == false ? document.getElementById(`edit-${id}`) : fragment.querySelector(`#edit-${id}`);
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
      window.location.href = `/study/make.html?c=edit`;
    });
    if (docSnap.history != undefined && docSnap.history.length != 0) {
      const btn = fragment == false ? document.getElementById(`history-${id}`) :  fragment.querySelector(`#history-${id}`);
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
              window.location.href = `/study/test.html?f=user&id=${item}`;
            });
          }
        }));
      });
    }
  }
  insertRows(docSnap.contents, id, fragment);
  container.style.animationDelay = `${Math.random() * 0.4}s`;
}
fin = true;
currentBoxes = [...Posts];
main.appendChild(firstFrgment);
setContainers(judgeBtns(currentBoxes), loadMore);
document.getElementById('search-modal').style.display = 'none';

function insertRows(contents, targetID, fragment = false) {
  const target = fragment === false ? document.getElementById(targetID) : fragment.querySelector(`#${CSS.escape(targetID)}`);
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



function setContainers(users = false, localLoadMore) {
  const unfixedContainers = document.querySelectorAll('div.container:not(.fixed)');
  const fragment = document.createDocumentFragment();
  for (const d of unfixedContainers) {
    main.removeChild(d);
  }
  if (users === false) {
    for (const element of Posts) {
      //usersがfalseのときは、全削除からの全追加
      createContainer(element, element.id, fragment);
    }
    return;
  }
  for (const element of users) {
    createContainer(element, element.id, fragment);
  }
  if (localLoadMore) {
    const loadMoreDiv = document.createElement('div');
    loadMoreDiv.className = 'container available';
    const loadMoreLabel = document.createElement('h2');
    loadMoreLabel.className = 'load-more-label';
    loadMoreLabel.textContent = 'もっと見る';
    loadMoreDiv.appendChild(loadMoreLabel);
    loadMoreDiv.addEventListener('click', async () => {
      await loadMoreClick();
      main.removeChild(loadMoreDiv);
    });

    fragment.appendChild(loadMoreDiv);
  }
  main.appendChild(fragment);
  MathJax.typeset();
}

async function loadMoreClick() {
  
      document.getElementById('search-modal').style.display = 'block';
      const newPosts = await fetchPosts();
      newPosts.forEach(post => {
        Posts.push({...post});
        currentBoxes.push({...post});
        createContainer(post, post.id, false);
      });
      Posts = [...Posts];
      //setContainers(judgeBtns(currentBoxes), loadMore);
      if (loadMore) {
        const loadMoreDiv = document.createElement('div');
        loadMoreDiv.className = 'container available';
        const loadMoreLabel = document.createElement('h2');
        loadMoreLabel.className = 'load-more-label';
        loadMoreLabel.textContent = 'もっと見る';
        loadMoreDiv.appendChild(loadMoreLabel);
        loadMoreDiv.addEventListener('click', async () => {
          await loadMoreClick();
          main.removeChild(loadMoreDiv);
        });

        main.appendChild(loadMoreClick);
      }
      originalData = [...currentBoxes];

      document.getElementById('search-modal').style.display = 'none';
}

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

  return data;
}

document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = input.value;
    if (value[0] == '#') {
      if (value.length == 1) {
        currentBoxes = [...originalData];
        setContainers(judgeBtns(currentBoxes), loadMore);
        return;
      }
      document.getElementById('search-modal').style.display = 'block';
      const id = value.slice(1, value.length);
      const idHit = await getDocs(query(collection(db, "posts"), orderBy("__name__"), startAt(id), endAt((id + "\uf8ff"))));
      currentBoxes = [...idHit.docs.map(e => ({id: e.id, ...e.data()}))];
      setContainers(judgeBtns(currentBoxes), false);
      document.getElementById('search-modal').style.display = 'none';
    } else if (value.length) {
      // valueにデータがある
      // titleから検索
      document.getElementById('search-modal').style.display = 'block';
      const titleHit = await getDocs(query(collection(db, "posts"), orderBy("title"), startAt(value), endAt((value + "\uf8ff"))));
      currentBoxes = [...titleHit.docs.map(e => ({id: e.id, ...e.data()}))];
      setContainers(judgeBtns(currentBoxes), false);
      document.getElementById('search-modal').style.display = 'none';
    } else {
      currentBoxes = [...originalData];
      setContainers(judgeBtns(currentBoxes), loadMore);
  }
});

function sortData(arr) {
  let data = [...arr];
  if (filterBtns[1]) {
    data.sort((a, b) => b.good - a.good);
  } else if (filterBtns[2]) {
    data.sort((a, b) => a.subject - b.subject);
  } else if (filterBtns[3]) {
    data.sort((a, b) => b.createdAt - a.createdAt);
  }
  if (filterBtns[0]) {
    data = data.filter(e => favorites.includes(e.id));
  }
  return data;
}
