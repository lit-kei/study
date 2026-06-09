import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://kmywohyexzsrsjdfkybj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtteXdvaHlleHpzcnNqZGZreWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjEyNDIsImV4cCI6MjA4NDgzNzI0Mn0.KKBuGq5-byWU2O6_oFqpTEBCoPqvSjuhp47OfJyQ1rs";

export const supabase = createClient(supabaseUrl, supabaseKey);

let learning = false;

const learningCountLabel = {
  x: 20,
  y: 20,
  value: 0,

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "#333";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(
      `学習中：${this.value}人`,
      this.x,
      this.y
    );
    ctx.restore();
  }
};

const userId =
  localStorage.getItem("study_user_id") ??
  crypto.randomUUID();
let userName =
  localStorage.getItem("study_user_name") ?? null;
let myColor = randomPastelColor();

  
localStorage.setItem("study_user_id", userId);

let viewWidth = 0;
let viewHeight = 0;

const channel = supabase.channel("study-users-changes");

const nameModal = document.getElementById("nameModal");
const nameInput = document.getElementById("nameInput");
const nameError = document.getElementById("nameError");
const nameCount = document.getElementById("nameCount");
const confirmBtn = document.getElementById("nameConfirm");
const cancelBtn = document.getElementById("nameCancel");
const spinner = document.getElementById("spinner");
const modalMain = document.getElementById("modalMain");

const dots = new Map(); // userId => dot
let lastLearningUserIds = new Set();
let learningUsers = new Map();

async function initUser() {
  if (!userName) {
    cancelBtn.style.display = "none";
    nameModal.style.display = "block";
  } else {

    await supabase
      .from("study-users")
      .upsert({
        id: userId,
        name: userName,
        learning: false,
        last_seen: new Date()
      });
    }
}

initUser();

getLearningUserIds().then(users => {
  learningUsers = users;
  console.log("学習中：", users);
  learningCountLabel.value = users.size;
});

channel.on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "study-users"
  },
  async (payload) => {
      const row = payload.new;
      console.log(row);

    const isLearning =
      row.learning && isOnline(row.last_seen);

    if (isLearning) {
      learningUsers.set(row.id, {last_seen: new Date(row.last_seen), color: row.color, name: row.name});
      const dot = dots.get(row.id);
      if (dot) {
        dot.color = row.color;
        dot.name = row.name ?? "匿名";
      } else {
          const newDot = createOneDot(true, row.id == userId, row.color ?? randomPastelColor(), row.name ?? "匿名");
          dots.set(row.id, newDot);
      }
    } else {
      learningUsers.delete(row.id);
      const dot = dots.get(row.id);
      if (dot) removeDotWithFade(dot);
    }

    learningCountLabel.value = learningUsers.size;

    /*
    // 追加
    for (const [id, user] of learningUsers) {
      if (!lastLearningUserIds.has(id)) {
        if (dots.size >= MAX_DOTS) break; // ★ 制限
        if (!dots.get(id)) {
          const dot = createOneDot(true, id == userId, user.color ?? randomPastelColor(), user.name ?? "匿名");
          dots.set(id, dot);
        }
      }
    }

    // 削除
    for (const id of lastLearningUserIds) {
      if (!learningUsers.has(id)) {
        const dot = dots.get(id);
        if (dot) removeDotWithFade(dot);
      }
    }

    lastLearningUserIds = new Set(learningUsers.keys());*/

  }
).subscribe((status) => {
    console.log("channel status:", status);

    if (status === "SUBSCRIBED") {
      console.log("SUBSCRIBED");
    }
  });
/*await supabase
  .from("study-users")
  .upsert({
    id: userId,
    learning: false,
    last_seen: new Date()
  });*/




async function startLearning() {
  myColor = randomPastelColor();
  await supabase
    .from("study-users")
    .update({
      learning: true,
      started_at: new Date(),
      last_seen: new Date(),
      color: myColor
    })
    .eq("id", userId);
  
}

async function stopLearning() {
  await supabase
    .from("study-users")
    .update({
      learning: false
    })
    .eq("id", userId);
}

function isOnline(lastSeen) {
  return Date.now() - new Date(lastSeen).getTime() < 30000;
}

async function getLearningUserIds() {
  const { data, error } = await supabase
    .from("study-users")
    .select("*");

  if (error) {
    console.error(error);
    return new Map();
  }

  const ids = new Map();

  for (const user of data) {
    if (user.learning && isOnline(user.last_seen)) {
      ids.set(user.id, {last_seen: new Date(user.last_seen), color: user.color, name: user.name});
    }
  }

  return ids;
}

let updating = false;

setInterval(async () => {
  if (updating) return;
  updating = true;

  try {
    await supabase
      .from("study-users")
      .update({
        last_seen: new Date()
      })
      .eq("id", userId);
  } finally {
    updating = false;
  }
}, 15000);

setInterval(() => {
  const now = Date.now();
  for (const [id, user] of learningUsers) {
    if (now - user.last_seen > 30000) {
      console.log(id);
      learningUsers.delete(id); // ← 退出扱い
      const dot = dots.get(id);
      if (dot) removeDotWithFade(dot);
    }
  }

  learningCountLabel.value = learningUsers.size;
}, 5000);

// MARK: 以下描画処理


const MAX_LENGTH = 10;

confirmBtn.addEventListener("click", async () => {
  const value = nameInput.value.trim();

  // 空はOK（名無し）
  if (value.length === 0) {
    submitName(null);
    return;
  }

  // 長すぎる場合
  if (value.length > MAX_LENGTH) {
    nameError.textContent = `名前は${MAX_LENGTH}文字以内にしてください`;
    nameError.style.display = "block";

    // UX：入力欄にフォーカス戻す
    nameInput.focus();
    nameInput.select();
    return;
  }

  // OK
  submitName(value);
});
cancelBtn.addEventListener("click", () => {
  nameModal.style.display = "none";
})
async function submitName(name) {
  nameError.style.display = "none";
  cancelBtn.style.display = "block";
  modalMain.style.visibility = "hidden";
  spinner.style.display = "block";

  await supabase
    .from("study-users")
    .update({
      name: name
    })
    .eq("id", userId);
  spinner.style.display = "none";
  modalMain.style.visibility = "visible";
  nameModal.style.display = "none";
  userName = name ?? "匿名";
  localStorage.setItem("study_user_name", userName);
}
nameInput.addEventListener("input", () => {
  const l = nameInput.value.length;
  if (l <= MAX_LENGTH) {
    nameCount.innerHTML = `${l} / <strong>${MAX_LENGTH}</strong>`;
  } else {
    nameCount.innerHTML = `<span style="color: red;">${l}</span> / <strong>${MAX_LENGTH}</strong>`;
  }
});
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    confirmBtn.click();
  }
});

document.getElementById("settingsBtn").addEventListener("click", async () => {
    nameModal.style.display = "block";
    nameInput.value = userName;
    nameInput.focus();
    nameInput.select();
    nameCount.innerHTML = `${userName.length} / <strong>${MAX_LENGTH}</strong>`;
});

const MAX_DOTS = 30;




const container = document.getElementById('container');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 補間関数（0〜1）
function lerp(a, b, t) {
  return a + (b - a) * t;
}


const text_s = {
    x: 400,
    y: 350,
    alpha: 1,
    target: 1,

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "white";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("START", this.x, this.y);
        ctx.restore();

    },

    update() {
        const speed = 0.3;
        this.alpha = lerp(this.alpha, this.target, speed);
    }
    
}

const text_t = {
    x: 400,
    y: 350,
    alpha: 0,
    target: 0,
    startTime: 0,

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "#666";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.timeToString(), this.x, this.y);
        ctx.restore();

    },

    update() {
        const speed = 1;
        this.alpha = lerp(this.alpha, this.target, speed);
    },

    timeToString() {
        const ms = performance.now() - this.startTime;
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0")
        );
    }

}


// 円オブジェクト
const circle = {
  x: 400,
  y: 350,
  r: 250,

  
  


  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);

    if (learning) {
        // 枠線だけ
        ctx.strokeStyle = myColor;
        ctx.lineWidth = 6; // お好みで
        ctx.stroke();
    } else {
        // 塗りつぶし
        ctx.fillStyle = `rgb(116, 185, 255)`;
        ctx.fill();
    }
    },

  contains(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return dx * dx + dy * dy <= this.r * this.r;
  }
};




// クリックで目標色を切り替える
canvas.addEventListener("click", async (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (!circle.contains(x, y)) return;

  if (learning) {
    const ok = await requestEndStudy(); // ← ここで停止！

    if (!ok) return; // キャンセルされたら何もしない
    endStudyConfirmed();

    stopLearning();
    text_s.target = 1;
    text_t.target = 0;
    learning = false;

  } else {
    startLearning();
    text_s.target = 0;
    text_t.target = 1;
    text_t.startTime = performance.now();
    learning = true;
  }
});

function randomPastelColor() {
  const h = Math.random() * 360;          // 色相：完全ランダム
  const s = 50 + Math.random() * 20;      // 彩度：50–70%
  const l = 70 + Math.random() * 10;      // 明度：70–80%（白飛び防止）

  return `hsl(${h}, ${s}%, ${l}%)`;
}
function createOneDot(popping = true, isMine = false, color, name) {
  const baseR = 20 + Math.random() * 25;

  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,


    baseR,
    r: isMine ? circle.r : popping ? 0 : baseR,
    scale: popping ? 0 : 1,
    alpha: 0.8 + Math.random() * 0.2,
    color,
    name,

    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,

    phase: Math.random() * Math.PI * 2,
    bornAt: performance.now(),
    popping,
    isMine,

    removing: false
  };
}
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeOutSine(start, end, x) {
return start + (end - start) * Math.sin((x * Math.PI) / 2);;
}


function drawDots(ctx) {
  ctx.save();

  dots.forEach(dot => {
    ctx.globalAlpha = dot.alpha;
    ctx.fillStyle = dot.color;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '18px Arial';
    ctx.fillText(dot.name, dot.x, dot.y - dot.r - 14);

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}
function updateDots() {
  dots.forEach((dot, id) => {
    dot.phase += 0.02;
    const dvx = (Math.random() - 0.5) * 0.1;
    const dvy = (Math.random() - 0.5) * 0.1;
    if (Math.abs(dot.vx + dvx) <= 0.5) dot.vx += dvx;
    if (Math.abs(dot.vy + dvy) <= 0.5) dot.vy += dvy;
    dot.x += dot.vx;
    dot.y += dot.vy;
    dot.y += Math.sin(dot.phase) * 0.2;

    if (dot.popping) {
      if (!dot.isMine) { 
        const t = (performance.now() - dot.bornAt) / 500;
        const clamped = Math.min(t, 1);
        dot.scale = easeOutBack(clamped);
        dot.r = dot.baseR * dot.scale;
        if (clamped >= 1) dot.popping = false;
      } else {
        dot.x = circle.x;
        dot.y = circle.y
        const t = (performance.now() - dot.bornAt) / 1500;
        const clamped = Math.min(t, 1);
        dot.r = easeOutSine(circle.r, dot.baseR, t);
        if (clamped >= 1) dot.popping = false;
      }
    }

    // ★ フェードアウト処理
    if (dot.removing) {
      dot.alpha -= 0.02;
      dot.r *= 0.96;
      if (dot.alpha <= 0.01) {
        dots.delete(id);
      }
    }
    // 壁で反射// 左
    if (dot.x - dot.r < 0) {
      dot.x = dot.r;
      dot.vx *= -1;
    }

    // 右
    if (dot.x + dot.r > viewWidth) {
      dot.x = viewWidth - dot.r;
      dot.vx *= -1;
    }

    // 上
    if (dot.y - dot.r < 0) {
      dot.y = dot.r;
      dot.vy *= -1;
    }

    // 下
    if (dot.y + dot.r > viewHeight) {
      dot.y = viewHeight - dot.r;
      dot.vy *= -1;
    }
  });
}
function removeDotWithFade(dot) {
  dot.removing = true;
}

let lastWidth = 0;
let lastHeight = 0;
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  viewWidth = container.clientWidth;
  viewHeight = container.clientHeight;

  if (viewWidth === lastWidth && viewHeight === lastHeight) {
    return;
  }

  lastWidth = viewWidth;
  lastHeight = viewHeight;

  canvas.style.width = viewWidth + "px";
  canvas.style.height = viewHeight + "px";

  canvas.width = Math.floor(viewWidth * dpr);
  canvas.height = Math.floor(viewHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  circle.x = viewWidth / 2;
  circle.y = viewHeight / 2 - 50;

  // ★ モバイル暴走を防ぐポイント
  const minSize = Math.min(viewWidth, viewHeight);
  circle.r = minSize * 0.3;

  // 最大半径を制限（これが効く）
  circle.r = Math.min(circle.r, 220);
  text_s.x = circle.x;
  text_s.y = circle.y;
  text_t.x = circle.x;
  text_t.y = circle.y;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // 最初に必ず呼ぶ

// 更新
function update() {
  updateDots();
  text_s.update();
  text_t.update();
}

// 描画
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (learning) {
    drawDots(ctx);
  }
  circle.draw(ctx);
  text_s.draw(ctx);
  text_t.draw(ctx);

  
  learningCountLabel.draw(ctx);
}

// 30fps ループ
setInterval(() => {
  update();
  draw();
}, 1000 / 30);

const endModal = document.getElementById("endModal");function requestEndStudy() {
  return new Promise((resolve) => {
    const modal = document.getElementById("endModal");

    modal.classList.remove("hidden");

    const confirmBtn = document.getElementById("confirmEnd");
    const cancelBtn = document.getElementById("cancelEnd");

    const cleanup = () => {
      modal.classList.add("hidden");
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
    };

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  });
}
function formatStudyTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}分${seconds}秒`;
}
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  const text = document.getElementById("toast-text");

  text.textContent = message;

  toast.classList.remove("hidden");
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 400);
  }, duration);
}
async function endStudyConfirmed() {
  const elapsed = performance.now() - text_t.startTime;

  stopLearning();

  showToast(
    `あなたは ${formatStudyTime(elapsed)} 勉強しました`
  );
}
document.getElementById("cancelEnd").addEventListener("click", () => {
  endModal.classList.add("hidden");
});
