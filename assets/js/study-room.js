import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://kmywohyexzsrsjdfkybj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtteXdvaHlleHpzcnNqZGZreWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjEyNDIsImV4cCI6MjA4NDgzNzI0Mn0.KKBuGq5-byWU2O6_oFqpTEBCoPqvSjuhp47OfJyQ1rs";

export const supabase = createClient(supabaseUrl, supabaseKey);



const userId =
  localStorage.getItem("study_user_id") ??
  crypto.randomUUID();

localStorage.setItem("study_user_id", userId);

const channel = supabase.channel("study-room", {
  config: {
    presence: {
      key: userId
    }
  }
});
await supabase
  .from("study-users")
  .upsert({
    id: userId,
    learning: false
  });

window.createOneDot = createOneDot;

const dots = new Map(); // userId => dot
let lastLearningUserIds = new Set();

channel.on("presence", { event: "sync" }, () => {
  const currentIds = getLearningUserIds();

  // 追加
  for (const id of currentIds) {
    if (!lastLearningUserIds.has(id)) {
      const dot = createOneDot(true);
      dots.set(id, dot);
    }
  }

  // 削除
  for (const id of lastLearningUserIds) {
    if (!currentIds.has(id)) {
      const dot = dots.get(id);
      if (dot) removeDotWithFade(dot);
    }
  }

  lastLearningUserIds = new Set(currentIds);
});

channel.subscribe(async status => {
  console.log("presence status:", status);
  if (status === "SUBSCRIBED") {
    await channel.track({
      userId,
      learning: false
    });
  }
});



async function startLearning() {
  await supabase
    .from("study-users")
    .update({
      learning: true,
      started_at: new Date()
    })
    .eq("id", userId);  
  await channel.track({
    userId,
    learning: true
  });
  
  setTimeout(() => {
    console.log("after learning=true:", channel.presenceState());
  }, 500);
}

async function stopLearning() {
  await supabase
    .from("study-users")
    .update({
      learning: false
    })
    .eq("id", userId);
  await channel.track({
    userId,
    learning: false
  });
}


function getLearningUserIds() {
  const state = channel.presenceState();
  const ids = new Set();

  Object.values(state).forEach(presences => {
    presences.forEach(p => {
      if (p.learning === true) {
        ids.add(p.userId);
      }
    });
  });

  return ids;
}









// MARK: 以下描画処理




let learning = false;


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

  
  

  // 現在の色（RGB）
  color: { r: 116, g: 185, b: 255 }, // 青
  // 目標の色
  target: { r: 116, g: 185, b: 255 },

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);

    if (learning) {
        // 枠線だけ
        ctx.strokeStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.lineWidth = 6; // お好みで
        ctx.stroke();
    } else {
        // 塗りつぶし
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.fill();
    }
    },

  update() {
    const speed = 0.15; // 小さいほどゆっくり

    this.color.r = lerp(this.color.r, this.target.r, speed);
    this.color.g = lerp(this.color.g, this.target.g, speed);
    this.color.b = lerp(this.color.b, this.target.b, speed);
  },

  contains(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return dx * dx + dy * dy <= this.r * this.r;
  }
};




// クリックで目標色を切り替える
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (circle.contains(x, y)) {
    if (learning) {
        stopLearning();
        circle.target = { r: 116, g: 185, b: 255 };
        text_s.target = 1;
        text_t.target = 0;
    } else {
        startLearning();
        circle.target = { r: 255, g: 118, b: 117 };
        text_s.target = 0;
        text_t.target = 1;
        text_t.startTime = performance.now();
    }
    learning = !learning;

  }
});


function randomPastelColor() {
  const r = Math.floor(180 + Math.random() * 60);
  const g = Math.floor(180 + Math.random() * 60);
  const b = Math.floor(180 + Math.random() * 60);
  return `rgb(${r}, ${g}, ${b})`;
}
function createOneDot(popping = true) {
  const baseR = 6 + Math.random() * 14;

  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,

    baseR,
    r: popping ? 0 : baseR,
    scale: popping ? 0 : 1,
    alpha: 0.8 + Math.random() * 0.2,
    color: randomPastelColor(),

    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,

    phase: Math.random() * Math.PI * 2,
    bornAt: performance.now(),
    popping,

    removing: false
  };
}
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}



function drawDots(ctx) {
  ctx.save();

  dots.forEach(dot => {
    ctx.globalAlpha = dot.alpha;
    ctx.fillStyle = dot.color;

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}
function updateDots() {
  dots.forEach((dot, id) => {
    dot.phase += 0.02;

    dot.x += dot.vx;
    dot.y += dot.vy;
    dot.y += Math.sin(dot.phase) * 0.2;

    if (dot.popping) {
      const t = (performance.now() - dot.bornAt) / 500;
      const clamped = Math.min(t, 1);
      dot.scale = easeOutBack(clamped);
      dot.r = dot.baseR * dot.scale;
      if (clamped >= 1) dot.popping = false;
    }

    // ★ フェードアウト処理
    if (dot.removing) {
      dot.alpha -= 0.02;
      dot.r *= 0.96;
      if (dot.alpha <= 0.01) {
        dots.delete(id);
      }
    }

    // 画面外ループ
    if (dot.x < -dot.r) dot.x = canvas.width + dot.r;
    if (dot.x > canvas.width + dot.r) dot.x = -dot.r;
    if (dot.y < -dot.r) dot.y = canvas.height + dot.r;
    if (dot.y > canvas.height + dot.r) dot.y = -dot.r;
  });
}
function removeDotWithFade(dot) {
  dot.removing = true;
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  const cssWidth = container.clientWidth;
  const cssHeight = container.clientHeight;

  // 見た目サイズ（CSS）
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";

  // 実解像度
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  // 以降の描画は「CSSピクセル」で行う
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 中心・半径（CSS基準）
  circle.x = cssWidth / 2;
  circle.y = cssHeight / 2 - 50;

  // ★ モバイル暴走を防ぐポイント
  const minSize = Math.min(cssWidth, cssHeight);
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
  circle.update();
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
}

// 30fps ループ
setInterval(() => {
  update();
  draw();
}, 1000 / 30);