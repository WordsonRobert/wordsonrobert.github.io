import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// === DATA ===
const MOVIE_TITLES = [
    "BLADE RUNNER", "AKIRA", "SOLARIS", "THE THING", "ALIEN", "STALKER", 
    "HEREDITARY", "MIDSOMMAR", "THE LIGHTHOUSE", "DUNE", "2001: SPACE ODYSSEY", 
    "METROPOLIS", "BRAZIL", "VIDEODROME", "TETSUO", "PI", 
    "ERASERHEAD", "THE FLY", "POSSESSION", "SUSPIRIA"
];
const YOUTUBE_IDS = ['J7nZp256oYk', 'cy7615-jF0M', 'dFk75_Y4vG4', '2HkjrJ6IK5E'];
const DATABASE = Array.from({ length: 60 }, (_, i) => ({
    id: YOUTUBE_IDS[i % YOUTUBE_IDS.length],
    title: MOVIE_TITLES[i % MOVIE_TITLES.length],
    year: 1970 + Math.floor(Math.random() * 55),
    x: (Math.random() - 0.5) * 450, 
    z: (Math.random() - 0.5) * 450
}));

// === SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202); 
scene.fog = new THREE.FogExp2(0x020202, 0.012); // Deep, clean dark fog

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('canvas-container').appendChild(cssRenderer.domElement);

// === BLOOM (ELEGANT GLOW) ===
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloom.threshold = 0.1; 
bloom.strength = 1.0;   // Softer, dreamy glow
bloom.radius = 0.8;     // Wider radius for "God Ray" effect
composer.addPass(bloom);

// === CONTROLS ===
const controls = new PointerLockControls(camera, document.body);
const startBtn = document.getElementById('start-btn');
if(startBtn) startBtn.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('hud').style.opacity = 1;
});
controls.addEventListener('unlock', () => {
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('hud').style.opacity = 0.5;
});

// === WORLD BUILDING ===

// 1. FLOOR (Black Velvet)
// Totally matte, absorbs light.
const floorGeo = new THREE.PlaneGeometry(1200, 1200);
const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x010101, 
    roughness: 1.0, 
    metalness: 0.0 
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 2. THE ARTIFACT SHIP (Black & Gold)
const shipGroup = new THREE.Group();
shipGroup.position.set(0, -6, -70);
shipGroup.scale.set(7, 7, 7);
scene.add(shipGroup);

// Material: Obsidian Hull with Gold Light
const shipMat = new THREE.MeshStandardMaterial({ 
    color: 0x050505,       // Near Black
    roughness: 0.2,        // Slightly polished
    metalness: 0.8,        // Metallic
    emissive: 0xffaa00,    // GOLD GLOW
    emissiveIntensity: 0.5
});

// Hull
const hull = new THREE.Mesh(new THREE.CylinderGeometry(8, 12, 50, 16), shipMat);
hull.rotation.x = Math.PI / 2;
hull.rotation.z = -0.15;
shipGroup.add(hull);

// Engine Ring
const engine = new THREE.Mesh(new THREE.TorusGeometry(8, 2, 16, 32), shipMat);
engine.position.set(0, 5, -25);
engine.rotation.y = Math.PI / 2;
shipGroup.add(engine);

// THE GOLDEN CORE LIGHT
const mainLight = new THREE.PointLight(0xffaa00, 8, 300); // Warm Golden Light
mainLight.position.set(0, 15, 0);
mainLight.castShadow = true;
shipGroup.add(mainLight);


// 3. SILVER WHEAT (Classy Grass)
const grassCount = 45000; 
const grassGeo = new THREE.PlaneGeometry(0.15, 0.9); 
// Silver/White look
const grassMat = new THREE.MeshStandardMaterial({
    color: 0x222222, 
    emissive: 0xaaaaaa, // SILVER GLOW
    emissiveIntensity: 0.15, // Subtle, not neon
    side: THREE.DoubleSide
});
const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
const dummy = new THREE.Object3D();

for (let i = 0; i < grassCount; i++) {
    dummy.position.set(
        (Math.random() - 0.5) * 550,
        0.45,
        (Math.random() - 0.5) * 550
    );
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    // Slight size variation
    dummy.scale.setScalar(Math.random() * 0.4 + 0.6);
    dummy.updateMatrix();
    grassMesh.setMatrixAt(i, dummy.matrix);
}
scene.add(grassMesh);


// 4. THE GHOST (Silk)
const ghostGroup = new THREE.Group();
ghostGroup.position.set(0, 5, -20); 
scene.add(ghostGroup);

const ghostGeo = new THREE.CylinderGeometry(1, 3, 7, 32, 10, true);
// Silk Material
const ghostMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xffffff, 
    roughness: 0.4,
    metalness: 0.1,
    transmission: 0.2, // Slight glass-like quality
    thickness: 1.0,
    side: THREE.DoubleSide, 
    transparent: true, 
    opacity: 0.9,
    emissive: 0xccccff,
    emissiveIntensity: 0.2
});
const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
ghostGroup.add(ghostMesh);

const eyeGeo = new THREE.SphereGeometry(0.25);
const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const lEye = new THREE.Mesh(eyeGeo, eyeMat); lEye.position.set(-0.5, 2, 0.9);
const rEye = new THREE.Mesh(eyeGeo, eyeMat); rEye.position.set(0.5, 2, 0.9);
ghostGroup.add(lEye); ghostGroup.add(rEye);

// Ghost Light (Cool Blue to contrast Gold Ship)
const ghostLight = new THREE.PointLight(0xaaccff, 2, 20);
ghostGroup.add(ghostLight);


// 5. OBSIDIAN MONOLITHS
const monolithGeo = new THREE.BoxGeometry(2.5, 7, 0.8);
const monolithMat = new THREE.MeshStandardMaterial({ 
    color: 0x050505, 
    roughness: 0.1, // Polished
    metalness: 0.6, // Slight reflection
});

DATABASE.forEach((data) => {
    const group = new THREE.Group();
    group.position.set(data.x, 3.5, data.z);
    
    // Less chaotic rotation, more "Ancient Ruins"
    group.rotation.y = Math.random() * Math.PI;
    
    const mesh = new THREE.Mesh(monolithGeo, monolithMat);
    mesh.castShadow = true; 
    mesh.receiveShadow = true;
    group.add(mesh);
    
    // Add a gold rim to monoliths?
    // Let's keep it simple for now, just sleek black.
    
    group.userData = { id: data.id, title: data.title, year: data.year, active: false };
    scene.add(group);
});


// 6. ETHER BARRIER (The Shimmer)
// Changed to a subtle gold/white shimmer
const shimmerGeo = new THREE.SphereGeometry(400, 64, 64);
const shimmerMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, viewVector: { value: new THREE.Vector3() } },
    vertexShader: `
        varying vec3 vNormal; varying vec3 vViewPosition;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform float time; varying vec3 vNormal; varying vec3 vViewPosition;
        void main() {
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = dot(viewDir, vNormal);
            fresnel = 1.0 - fresnel;
            fresnel = pow(fresnel, 5.0); // Very thin edge
            
            vec3 color = vec3(0.0);
            // Golden/White Spectrum
            color.r = 1.0;
            color.g = 0.9 + sin(time) * 0.1;
            color.b = 0.8 + cos(time) * 0.2;
            
            float opacity = smoothstep(0.4, 1.0, fresnel) * 0.15; // Very subtle
            gl_FragColor = vec4(color, opacity);
        }
    `,
    transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending
});
const shimmerSphere = new THREE.Mesh(shimmerGeo, shimmerMat);
scene.add(shimmerSphere);

// === LIGHTS ===
const ambient = new THREE.AmbientLight(0x050505, 1.0); // Neutral ambient
scene.add(ambient);
const flashLight = new THREE.SpotLight(0xffeedd, 2, 100, 0.5, 0.5); // Warm white flashlight
flashLight.position.set(0,0,0);
camera.add(flashLight);
scene.add(camera);

// === ANIMATION LOOP ===
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
let moveF=false, moveB=false, moveL=false, moveR=false;
const velocity = new THREE.Vector3(); const direction = new THREE.Vector3();
const ghostPosAttr = ghostGeo.attributes.position;
const originalGhostPos = ghostPosAttr.array.slice();
let prevTime = performance.now();

document.addEventListener('keydown', (e) => {
    switch(e.code) { case 'KeyW': moveF=true; break; case 'KeyA': moveL=true; break; case 'KeyS': moveB=true; break; case 'KeyD': moveR=true; break; }
});
document.addEventListener('keyup', (e) => {
    switch(e.code) { case 'KeyW': moveF=false; break; case 'KeyA': moveL=false; break; case 'KeyS': moveB=false; break; case 'KeyD': moveR=false; break; }
});
document.addEventListener('mousedown', () => {
    if (!controls.isLocked) return;
    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const hit = intersects.find(i => i.object.parent && i.object.parent.userData.id);
    if(hit && camera.position.distanceTo(hit.object.parent.position) < 15) {
        const group = hit.object.parent;
        if(group.userData.active) return;
        const div = document.createElement('div'); 
        div.innerHTML = `<iframe width="640" height="360" src="https://www.youtube.com/embed/${group.userData.id}?autoplay=1&rel=0" frameborder="0"></iframe>`;
        div.style.background = '#000';
        const cssObj = new CSS3DObject(div);
        cssObj.scale.set(0.005, 0.005, 0.005); cssObj.position.set(0, 0, 0.5);
        group.add(cssObj);
        group.userData.active = true;
    }
});

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    // Movement
    if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta; velocity.z -= velocity.z * 10.0 * delta;
        direction.z = Number(moveF) - Number(moveB); direction.x = Number(moveR) - Number(moveL);
        direction.normalize();
        if (moveF || moveB) velocity.z -= direction.z * 100.0 * delta;
        if (moveL || moveR) velocity.x -= direction.x * 100.0 * delta;
        controls.moveRight(-velocity.x * delta); controls.moveForward(-velocity.z * delta);
    }

    // Ghost Wiggle
    const positions = ghostGeo.attributes.position.array;
    for(let i=0; i < positions.length; i+=3) {
        if(originalGhostPos[i+1] < 1.0) {
            positions[i] = originalGhostPos[i] + Math.sin(time * 0.003 + originalGhostPos[i+1]) * 0.2;
            positions[i+2] = originalGhostPos[i+2] + Math.cos(time * 0.002 + originalGhostPos[i+1]) * 0.2;
        }
    }
    ghostGeo.attributes.position.needsUpdate = true;
    
    // Ghost Logic
    const gAngle = time * 0.0002;
    ghostGroup.position.x = Math.sin(gAngle) * 30; 
    ghostGroup.position.z = Math.cos(gAngle) * 30 - 30; 
    ghostGroup.lookAt(camera.position);

    // Ship Pulse (Breathing Gold)
    shipMat.emissiveIntensity = 0.5 + Math.sin(time * 0.002) * 0.3; // Slow, deep breath
    mainLight.intensity = 8 + Math.sin(time * 0.002) * 4;
    
    // Shimmer
    shimmerMat.uniforms.time.value = time * 0.001;
    shimmerSphere.position.copy(camera.position);

    // UI
    document.getElementById('pos-display').innerText = `POS: ${Math.round(camera.position.x)}, ${Math.round(camera.position.z)}`;
    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const hit = intersects.find(i => i.object.parent && i.object.parent.userData.id);
    const crosshair = document.getElementById('crosshair');
    const scanner = document.getElementById('scanner');
    
    if (hit && camera.position.distanceTo(hit.object.parent.position) < 20) {
        crosshair.classList.add('active'); scanner.style.opacity = 1;
        document.getElementById('scan-title').innerText = hit.object.parent.userData.title;
        document.getElementById('scan-meta').innerText = `ID: ${hit.object.parent.userData.year}`;
    } else {
        crosshair.classList.remove('active'); scanner.style.opacity = 0;
    }

    composer.render();
    cssRenderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
