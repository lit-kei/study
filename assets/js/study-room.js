
const dots = [];
const DOT_COUNT = 50; // ← 多すぎない数


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
        circle.target = { r: 116, g: 185, b: 255 };
        text_s.target = 1;
        text_t.target = 0;
    } else {
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

function createDots() {
  dots.length = 0;

  for (let i = 0; i < DOT_COUNT; i++) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 6 + Math.random() * 14,
      alpha: 0.8 + Math.random() * 0.2,
      color: randomPastelColor(),

      // ふわふわ用の微小速度
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,

      // 個体差用（揺れ）
      phase: Math.random() * Math.PI * 2
    });
  }
}


createDots();

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
  dots.forEach(dot => {
    dot.phase += 0.02;

    // 基本移動
    dot.x += dot.vx;
    dot.y += dot.vy;

    // ふわっとした揺れ
    dot.y += Math.sin(dot.phase) * 0.2;

    // 画面外に出たら反対側へ
    if (dot.x < -dot.r) dot.x = canvas.width + dot.r;
    if (dot.x > canvas.width + dot.r) dot.x = -dot.r;
    if (dot.y < -dot.r) dot.y = canvas.height + dot.r;
    if (dot.y > canvas.height + dot.r) dot.y = -dot.r;
  });
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  const cssWidth = container.clientWidth;
  const cssHeight = container.clientHeight;

  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 中心・半径を再計算
  circle.x = cssWidth / 2;
  circle.y = cssHeight / 2 - 50;
  circle.r = Math.min(cssWidth, cssHeight) * 0.3;

  text_s.x = circle.x;
  text_s.y = circle.y;

  text_t.x = circle.x;
  text_t.y = circle.y;

  

  createDots(); // サイズ変更時は水玉を作り直す
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