const links = [
  { href: "/study/index.html", title: "トップページ" },
  { href: "/study/feed.html", title: "みんなの問題集" },
  { href: "/study/menu.html", title: "フォルダ選択" },
  { href: "/study/howto.html", title: "使い方ガイド"}
];
const footerLinks = [
  { href: "/study/index.html", title: "トップページ" },
  { href: "/study/feed.html", title: "みんなの問題集" },
  { href: "/study/menu.html", title: "フォルダ選択" },
  { href: "/study/howto.html", title: "使い方ガイド"},
  { href: "/study/all-chugaku.html", title: "中学全範囲問題集"}
];

window.onload = function () {
  const metaTitle = document.querySelector('meta[name="title"]');
  const title = metaTitle ? metaTitle.getAttribute('content') : document.title || "暗記の小屋";
  const header = document.getElementsByTagName('header')[0];

  const inner = document.createElement('div');
  inner.classList.add('header-inner');

  const logoPicture = document.createElement('picture');

  const sourceWebp = document.createElement('source');
  sourceWebp.type = 'image/webp';
  sourceWebp.srcset = 'assets/images/logo.webp';
  logoPicture.appendChild(sourceWebp);

  const img = document.createElement('img');
  img.src = 'assets/images/logo.png';
  img.alt = '暗記の小屋のロゴ';
  img.classList.add('logo-img');
  img.style.cursor = 'pointer';
  img.onclick = () => window.location.href = '/study/index.html';

  logoPicture.appendChild(img);

  inner.appendChild(logoPicture);

  const h1 = document.createElement('h1');
  h1.textContent = title;
  inner.appendChild(h1);

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

  const other = document.createElement('div');
  other.classList.add('other-site');

  const h2 = document.createElement('h2');
  h2.textContent = "他のサイト";
  other.appendChild(h2);

  const strongOther = document.createElement('strong');
  const aOther = document.createElement('a');
  aOther.href = "https://lit-kei.github.io/prime/";
  aOther.target = "_blank";
  aOther.rel = "noopener noreferrer";
  aOther.textContent = "素因数分解シャトルラン";
  strongOther.appendChild(aOther);
  other.appendChild(strongOther);

  inner.appendChild(other);

  header.appendChild(inner);

  const main = document.getElementsByClassName('main-content')[0];

  const headerHeight = header.offsetHeight;
  main.style.paddingTop = headerHeight + 'px';

  let lastScrollY = window.pageYOffset;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    if (Math.abs(currentScrollY - lastScrollY) > 5) {
      if (currentScrollY > lastScrollY) {
        // スクロールダウン（隠す）
        header.style.transform = `translateY(-${headerHeight}px)`;
      } else {
        // スクロールアップ（表示）
        header.style.transform = 'translateY(0)';
      }
      lastScrollY = currentScrollY;
    }
  });

  const footer = document.getElementsByTagName('footer')[0];
  const footerContainer = document.createElement('div');
  footerContainer.className = "footer-container";
  const footerLink = document.createElement('div');
  footerLink.className = "footer-links";
  const footerInfo = document.createElement('div');
  footerInfo.className = "footer-info";
  footerInfo.innerHTML = `
  <small>&copy; 2025 暗記の小屋 | <a href="/study/privacy.html">プライバシーポリシー</a></small>
  `;
  footerLinks.forEach( ({ href, title }) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = title;
    footerLink.appendChild(a);
  });
  footerContainer.appendChild(footerLink);
  footerContainer.appendChild(footerInfo);
  footer.appendChild(footerContainer);
};