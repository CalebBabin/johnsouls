import TwitchChat from "twitch-chat-emotes-threejs";
import * as THREE from "three";
import Stats from "stats-js";
import "./main.css";
import generateShimmeryMat from "./shimmeryMaterial";
import generateTurbanMat from "./turbanMaterial";
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

	channels,
	maximumEmoteLimit: 3,
})

/*
** Initiate ThreejS scene
*/

export const camera = new THREE.PerspectiveCamera(
	query_vars.fov ? Number(query_vars.fov) : 70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 5;
camera.position.y = 0.75;
camera.lookAt(0, 2.5, 0);

export const scene = new THREE.Scene();
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

renderer.setSize(window.innerWidth, window.innerHeight);

import getComposer from './effects'
const composer = getComposer();

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('DOMContentLoaded', () => {
	resize();
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


	for (let i = 0; i < boxArts.length; i++) {
		const element = boxArts[i];
		const p = Date.now() / 10000 + (i / boxArts.length) * Math.PI * 2;
		element.position.x = Math.sin(p) * 5 + johnSoulsMesh.position.x;
		element.position.z = Math.cos(p) * 5 + johnSoulsMesh.position.z;
		element.rotation.z += delta * 0.1;
	}


	//renderer.render(scene, camera);
	composer.render();
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

import johnsmoulsURL from "./johnsmouls.png";
import johnsmoulsHighlightURL from "./johnsmoulsCutout.png";

const johnCanvas = document.createElement('canvas');
const johnContext = johnCanvas.getContext('2d');
const johnImage = new Image();
johnImage.onload = () => {
	johnCanvas.width = johnImage.width;
	johnCanvas.height = johnImage.height;
	if (chairImage.complete) {
		johnContext.drawImage(chairImage, 0, 0);
	}
	johnContext.drawImage(johnImage, 0, 0);
	johnTexture.needsUpdate = true;
};
let johnError = false;
johnImage.onerror = () => {
	if (johnError) return;
	johnError = true;
	johnImage.src = johnsmoulsURL + "?attempt2";
};
johnImage.src = johnsmoulsURL;

import johnChairURL from "./johnChair.png";
const chairImage = new Image();
chairImage.onload = () => {
	chairImage.width = johnImage.width;
	chairImage.height = johnImage.height;
	johnContext.drawImage(chairImage, 0, 0);
	if (johnImage.complete) {
		johnContext.drawImage(johnImage, 0, 0);
	}
	johnTexture.needsUpdate = true;
};
let chairError = false;
chairImage.onerror = () => {
	if (chairError) return;
	chairError = true;
	chairImage.src = johnChairURL + "?attempt2";
};
chairImage.src = johnChairURL;

const JohnWidth = 3.5;
const JohnHeight = JohnWidth * 2;
const johnSoulsPlane = new THREE.PlaneBufferGeometry(JohnWidth, JohnHeight, 1, 1);
const johnTexture = new THREE.Texture(johnCanvas);

const johnSoulsMesh = new THREE.Mesh(
	johnSoulsPlane,
	new THREE.MeshBasicMaterial({
		map: johnTexture,
		transparent: true,
		opacity: query_vars.nojohn !== undefined ? 0 : 1,
	})
);
const johnSoulsHighlight = new THREE.Mesh(
	johnSoulsPlane,
	generateShimmeryMat({
		map: new THREE.TextureLoader().load(johnsmoulsHighlightURL),
		transparent: true,
		opacity: 1,
		blending: THREE.AdditiveBlending,
	})
);
johnSoulsHighlight.position.z = 0.025;
johnSoulsMesh.add(johnSoulsHighlight);
johnSoulsMesh.position.set(0, 3.02, -3);
scene.add(johnSoulsMesh);

const hatSize = 4;
import hatURL from './hat.png';
import hatBlurURL from './hatBlur.png';
import hatDisplaceURL from './hatDisplace.png';
const JohnHat = new THREE.Mesh(
	new THREE.CylinderBufferGeometry(hatSize * 0.75, JohnWidth * 0.093, hatSize, 100, 600, true),
	generateTurbanMat({
		map: new THREE.TextureLoader().load(hatURL),
		bumpMap: new THREE.TextureLoader().load(hatBlurURL),
		bumpScale: 0.01,
		displacementMap: new THREE.TextureLoader().load(hatDisplaceURL),
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

/* game boxes */
import newBoxArt from './boxart';

import demonsoulsURL from './games/demonsouls.webp';
const gamebox = newBoxArt(demonsoulsURL);
gamebox.position.z = -3.8;
gamebox.position.y = -0.27;
gamebox.rotation.set(-Math.PI * 0.45, 0.02, 0.6 + Math.random() * 3);
gamebox.scale.setScalar(5);
setInterval(() => {
	gamebox.rotation.z += 0.0005;
}, 16)
scene.add(gamebox);


import darkSoulsURL from './games/darksouls.webp';
import darkSouls2URL from './games/darksouls2.webp';
import darkSouls3URL from './games/darksouls3.webp';
import eldenringURL from './games/eldenring.webp';
import bloodborneURL from './games/bloodborne.webp';
const boxArts = [
	newBoxArt(darkSoulsURL),
	newBoxArt(darkSouls2URL),
	newBoxArt(darkSouls3URL),
	newBoxArt(eldenringURL),
	newBoxArt(bloodborneURL),
];
for (let i = 0; i < boxArts.length; i++) {
	scene.add(boxArts[i]);
	boxArts[i].rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
	boxArts[i].scale.setScalar(2);
}


scene.background = new THREE.Color(0x000E16);
scene.fog = new THREE.Fog(scene.background, 4, 300);



import spriteClouds from './spriteClouds';
scene.add(spriteClouds);

/*const ground = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(1000, 1000, 1, 1),
	new THREE.MeshStandardMaterial({
		color: 0x222222,
		roughness: 0.6,
		metalness: 0.75,
	})
)
ground.rotateX(-Math.PI / 2);
ground.position.y = -1;
scene.add(ground);*/

const initLightShadows = (light) => {
	light.castShadow = true;
	light.shadow.mapSize.width = 64;
	light.shadow.mapSize.height = 64;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 10;
	light.shadow.bias = -0.001;
}

const lightTarget = new THREE.Object3D();
lightTarget.position.set(0, 10, johnSoulsMesh.position.z);
scene.add(lightTarget);

const johnLight = new THREE.SpotLight(0xFF8C66, 1, 20, Math.PI / 2);
johnLight.position.set(0, 3, 0);
johnLight.lookAt(new THREE.Vector3(0, -1, 0));
scene.add(johnLight);

const hatLight = new THREE.SpotLight(0xFF4C00, 1, 20, Math.PI / 6);
hatLight.position.set(0, 0, johnSoulsMesh.position.z + 1);
hatLight.target = lightTarget;
scene.add(hatLight);
initLightShadows(hatLight);

const backLight1 = new THREE.SpotLight(0x00B8FF, 0.6, 20, Math.PI / 6);
backLight1.position.set(3, 0, -3);
backLight1.target = lightTarget;
scene.add(backLight1);
initLightShadows(backLight1);

const backLight2 = new THREE.SpotLight(0x00B8FF, 0.6, 20, Math.PI / 6);
backLight2.position.set(-3, 0, -3);
backLight2.target = lightTarget;
scene.add(backLight2);
initLightShadows(backLight2);


const bottomLight = new THREE.SpotLight(0xA3E6FF, 1, 7, Math.PI / 2);
bottomLight.position.set(0, -5, 2);
bottomLight.target = lightTarget;
scene.add(bottomLight);