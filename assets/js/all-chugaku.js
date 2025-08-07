document.addEventListener("DOMContentLoaded", () => {
  const subjectData = {
    "国語": {units: ["文法", "古文", "漢字", "読解"], title: "japanese"},
    "数学": {units: ["素因数分解", "一次方程式", "比例・反比例", "図形", "関数"], title: "math"},
    "理科": {units: ["物理", "化学", "生物", "地学"], title: "science"},
    "社会": {units: ["地理", "歴史", "公民"], title: "social-studies"},
    "英語": {units: ["文法", "英単語", "リーディング", "リスニング"], title: "english"}
  };

  document.querySelectorAll(".subject-box").forEach(box => {
    const subject = box.dataset.subject;
    const header = box.querySelector(".subject-header");
    const unitsDiv = box.querySelector(".units");

    header.addEventListener("click", () => {
      if (unitsDiv.classList.contains("hidden")) {
        unitsDiv.innerHTML = "";
        for (let i = 0; i < subjectData[subject].units.length; i++) {
          const unitDiv = document.createElement("div");
          unitDiv.className = "unit";
          unitDiv.textContent = subjectData[subject].units[i];
          unitDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            if (subject == "数学" && i == 0) {
              window.open('https://lit-kei.github.io/prime/');
            } else {
              const url = `test.html?f=subject&id=${encodeURIComponent(subjectData[subject].title)}&unit=${i}`;
              window.location.href = url;
            }
          });
          unitsDiv.appendChild(unitDiv);
        }
        unitsDiv.classList.remove("hidden");
      } else {
        unitsDiv.classList.add("hidden");
      }
    });
  });
});
