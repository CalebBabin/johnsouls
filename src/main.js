import TwitchChat from "twitch-chat-emotes-threejs";
import * as THREE from "three";
import "./main.css";
import generateShimmeryMat from "./shimmeryMaterial";
import generateTurbanMat from "./turbanMaterial";
import Stats from "three/examples/jsm/libs/stats.module";
window.shaderPID = 10000;

/*
** connect to twitch chat
*/

// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});

if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

let stats = false;
if (query_vars.stats) {
	stats = new Stats();
	stats.showPanel(1);
	document.body.appendChild(stats.dom);
}

const ChatInstance = new TwitchChat({
	THREE,

	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.MeshBasicMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
		side: THREE.DoubleSide,
	},

	textureHook: (texture) => {
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.magFilter = THREE.NearestFilter;
	},

	channels,
	maximumEmoteLimit: 3,
})

/*
** Initiate ThreejS scene
*/

let camera = new THREE.PerspectiveCamera(
	query_vars.fov ? Number(query_vars.fov) : 70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 5;
camera.position.y = 0.75;
camera.lookAt(0, 2.5, 0);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

renderer.setSize(window.innerWidth, window.innerHeight);

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('resize', resize);
	if (query_vars.stats) document.body.appendChild(stats.dom);
	document.body.appendChild(renderer.domElement);
	draw();
})

/*
** Draw loop
*/
let lastFrame = Date.now();
function draw() {
	if (query_vars.stats) stats.begin();
	requestAnimationFrame(draw);
	const delta = (Date.now() - lastFrame) / 1000;

	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		if (element.timestamp + element.lifespan < Date.now()) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			element.update(delta);
		}
	}
	lastFrame = Date.now();


	renderer.render(scene, camera);
	if (query_vars.stats) stats.end();
};


/*
** Handle Twitch Chat Emotes
*/

import getVelocity from "./getVelocity";

const sceneEmoteArray = [];
const emoteGeometry = new THREE.PlaneGeometry(1.5, 1.5);
ChatInstance.listen((emotes) => {
	const group = new THREE.Group();
	group.rotation.y = Math.PI / 2;
	group.position.z = johnSoulsMesh.position.z;
	group.position.y = 2 + Math.random() * 4;


	group.lifespan = 10000;
	group.timestamp = Date.now();


	let i = 0;
	emotes.forEach((emote) => {
		const sprite = new THREE.Mesh(emoteGeometry, emote.material);
		sprite.position.x = i;
		group.add(sprite);
		i++;
	})

	const direction = Math.random() * Math.PI * 2;
	const distance = Math.random() * 4 + 2;
	group.position.x += Math.sin(direction) * distance * 2;
	group.position.z += Math.cos(direction) * distance;

	group.velocity = new THREE.Vector3();

	group.update = (delta) => { // called every frame
		let progress = (Date.now() - group.timestamp) / group.lifespan;

		if (progress <= emoteFadeLength) {
			group.scale.setScalar(Math.pow(progress * (1 / emoteFadeLength), 2) * emoteScale);
		} else if (progress >= 1 - emoteFadeLength) {
			group.scale.setScalar((1 - Math.pow((progress - (1 - emoteFadeLength)) * (1 / emoteFadeLength), 2)) * emoteScale);
		} else if (group.scale.x !== emoteScale) {
			group.scale.setScalar(emoteScale);
		}

		group.velocity.lerp(getVelocity(group.position.x, group.position.y, group.position.z), delta);
		group.position.set(
			group.position.x + group.velocity.x * delta,
			group.position.y + group.velocity.y * delta,
			group.position.z + group.velocity.z * delta,
		)
	}

	scene.add(group);
	sceneEmoteArray.push(group);
});

const emoteFadeLength = 0.1;
const emoteScale = 0.3;


/*
** Set up scene
*/


const johnCanvas = document.createElement('canvas');
const johnContext = johnCanvas.getContext('2d');
const johnImage = new Image();
johnImage.onload = () => {
	johnCanvas.width = johnImage.width;
	johnCanvas.height = johnImage.height;
	johnContext.drawImage(johnImage, 0, 0);
	johnTexture.needsUpdate = true;
};
let johnError = false;
johnImage.onerror = () => {
	if (johnError) return;
	johnError = true;
	johnImage.src = "/johnsmouls.png?attempt2";
};
johnImage.src = "/johnsmouls.png";

const JohnWidth = 3.5;
const JohnHeight = JohnWidth * 2;
const johnSoulsPlane = new THREE.PlaneGeometry(JohnWidth, JohnHeight, 1, 1);
const johnTexture = new THREE.Texture(johnCanvas);

const johnSoulsMesh = new THREE.Mesh(
	johnSoulsPlane,
	new THREE.MeshBasicMaterial({
		map: johnTexture,
		transparent: true,
		side: THREE.FrontSide,
	})
);
const johnSoulsHighlight = new THREE.Mesh(
	johnSoulsPlane,
	generateShimmeryMat({
		map: new THREE.TextureLoader().load("johnsmoulsCutout.png"),
		transparent: true,
		opacity: 1,
		blending: THREE.AdditiveBlending,
	})
);
johnSoulsHighlight.position.z = 0.025;
johnSoulsMesh.add(johnSoulsHighlight);
scene.add(johnSoulsMesh);

const hatSize = 4;
const JohnHat = new THREE.Mesh(
	new THREE.CylinderGeometry(hatSize * 0.75, JohnWidth * 0.093, hatSize, 100, 600, true),
	generateTurbanMat({
		map: new THREE.TextureLoader().load("/hat.png"),
		bumpMap: new THREE.TextureLoader().load("/hatBlur.png"),
		bumpScale: 0.01,
		displacementMap: new THREE.TextureLoader().load("/hatDisplace.png"),
		displacementScale: 0.15,
		color: 0xFFFFFF,
		specular: 0xff2211,
		shininess: 0,
	})
)
JohnHat.customDepthMaterial = generateTurbanMat({
	depthPacking: THREE.RGBADepthPacking,
	displacementMap: JohnHat.material.displacementMap,
	displacementScale: JohnHat.material.displacementScale,
}, true)
JohnHat.geometry.rotateY(-Math.PI);
JohnHat.position.y += hatSize * 0.5 + JohnHeight * 0.16;
JohnHat.position.x += JohnWidth * 0.118;
JohnHat.castShadow = true;
JohnHat.receiveShadow = true;
johnSoulsMesh.add(JohnHat);



// scene.background = new THREE.Color(0x000E16);
scene.background = new THREE.Color(0x000E16);
scene.fog = new THREE.Fog(scene.background, 4, 350);

// import spriteClouds from './spriteClouds';
// scene.add(spriteClouds);

const envGenerator = new THREE.PMREMGenerator(renderer);
envGenerator.compileCubemapShader();

new THREE.TextureLoader().load("/envmap.jpg", texture => {
	const envMap = envGenerator.fromEquirectangular(texture);
	scene.environment = envMap.texture;
});



import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/Addons.js";
import { applyLandscapeFog } from "./landscapeFog";
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
loader.setDRACOLoader(dracoLoader);
loader.load("/scene.glb", (gltf) => {
	const importedModel = gltf.scene;
	for (let i = 0; i < importedModel.children.length; i++) {
		const element = importedModel.children[i];
		element.castShadow = true;
		element.receiveShadow = true;

		if (element.isLight) {
			element.intensity *= 0.0075;
		}


		if (element.name === "Chair") {
			johnSoulsMesh.position.copy(element.position);
			johnSoulsMesh.position.y += 2.3;
			johnSoulsMesh.position.x += 0.7;
			johnSoulsMesh.rotation.y = Math.PI / 2;
			johnSoulsMesh.scale.multiplyScalar(0.8);
			console.log("found chair");
		} else if (element.isMesh) {
			element.material.side = THREE.FrontSide;
		}
		
		if (element.name === "Foreground") {
			element.material.side = THREE.BackSide;
		}

		if (element.name.endsWith("Fog")) {
			applyLandscapeFog(element.material);
		}

		console.log(element.name, element);
	}
	camera = gltf.cameras[0];
	camera.near = 0.1;
	camera.far = 350;
	scene.add(importedModel);
	resize();
});