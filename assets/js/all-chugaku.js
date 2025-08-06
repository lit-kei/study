import * as THREE from 'three';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/geometries/RoundedBoxGeometry.js';

const color = ["#E57373", "#64B5F6", "#4DB6AC", "#FBC02D", "#FF67AD"];
const boxes = [];
let rotation = 0;

const width = 960;
const height = 600;

// レンダラーを作成
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#webgl')
});
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

// シーンを作成
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f4f9);

// カメラを作成
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(0, 0, 700);      // Y軸上に500の高さ
camera.lookAt(0, 0, 0);

// 箱を作成
for (let i = 0; i < color.length; i++) {
    
    const geometry = new THREE.BoxGeometry(200, 320, 10);
    const material = new THREE.MeshStandardMaterial({color: color[i]});
    const box = new THREE.Mesh(geometry, material);
    boxes.push(box);
    scene.add(box);
}

// 平行光源
const light = new THREE.DirectionalLight(0xFFFFFF);
light.intensity = 1.5; // 光の強さを倍に
light.position.set(0, 100, 500);
light.target.position.set(0, 0, 0);
// シーンに追加
scene.add(light);

tick();

function tick() {
  requestAnimationFrame(tick);
  rotation += pi(1/750);

  boxes.forEach((box, i) => {
    // 箱を回転させる
    box.rotation.y = pi(2/5) * i + rotation;
    box.position.x = Math.sin(pi(2/5) * i + rotation) * 200;
    box.position.z = Math.cos(pi(2/5) * i + rotation) * 200;
  });
  // レンダリング
  renderer.render(scene, camera);
}

function pi(q) {
    return Math.PI * q;
}