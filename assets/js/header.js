const links = [
  { href: "index.html", title: "トップページ" },
  { href: "feed.html", title: "みんなの問題集" },
  { href: "menu.html", title: "フォルダ選択" }
];

window.onload = function () {
  const title = document.querySelector('meta[name="title"]').getAttribute('content');
  const header = document.getElementsByTagName('header')[0];

  const inner = document.createElement('div');
  inner.classList.add('header-inner');

  // ロゴ画像
  const logo = document.createElement('img');
  logo.src = "assets/images/logo.png";
  logo.alt = "暗記の小屋のロゴ";
  logo.classList.add("logo-img");
  logo.style.cursor = "pointer";
  logo.onclick = () => window.location.href = "index.html";
  inner.appendChild(logo);

  // タイトル（h1）
  const h1 = document.createElement('h1');
  h1.textContent = title;
  inner.appendChild(h1);

  // ナビゲーション（nav）
  const nav = document.createElement('nav');
  nav.id = "links";
  nav.classList.add("header-nav");
  links.forEach(({ href, title }) => {
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = title;
    strong.appendChild(a);
    nav.appendChild(strong);
  });
  inner.appendChild(nav);

  // 他のサイト（div.other-site）
  const other = document.createElement('div');
  other.classList.add('other-site');

  const h2 = document.createElement('h2');
  h2.textContent = "他のサイト";
  other.appendChild(h2);

  const strong = document.createElement('strong');
  const a = document.createElement('a');
  a.href = "https://lit-kei.github.io/prime/";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = "素因数分解シャトルラン";
  strong.appendChild(a);
  other.appendChild(strong);

  inner.appendChild(other);

  // ヘッダーに追加
  header.appendChild(inner);
};
