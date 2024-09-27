import * as THREE from 'three';

const width = 0.8, height = 1;

const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(0, height);
shape.lineTo(width, height);
shape.lineTo(width, 0);
shape.lineTo(0, 0);

const extrudeSettings = {
	steps: 1,
	depth: 0.01,
	bevelEnabled: true,
	bevelThickness: 0.02,
	bevelSize: 0.02,
	bevelOffset: 0,
	bevelSegments: 6,
};
const boxGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const disclaimerGeometry = new THREE.PlaneGeometry(width, height);
disclaimerGeometry.rotateX(Math.PI);

const artGeometry = new THREE.PlaneGeometry(width, height * 0.9);
artGeometry.translate(0, -height * 0.05, 0);

const headerGeometry = new THREE.PlaneGeometry(width, height * 0.1);
headerGeometry.translate(0, height * 0.451, 0);
import headerArtURL from './piss.png';
const headerArt = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	shininess: 50,
	map: new THREE.TextureLoader().load(headerArtURL),
})
headerArt.map.anisotropy = window.maxAnisotropy;


const boxMaterial = new THREE.MeshPhongMaterial({
	color: 0x6666ff,
	transparent: true,
	opacity: 0.95,
	shininess: 100,
})

import { ssrSelects } from './effects';

const generate = (url) => {
	const group = new THREE.Group();

	const box = new THREE.Mesh(boxGeometry, boxMaterial);
	group.add(box);


	box.position.z -= extrudeSettings.depth + extrudeSettings.bevelThickness;
	box.position.x -= width / 2;
	box.position.y -= height / 2;

	group.scale.setScalar(4);
	group.position.z = 2;

	/*const art = new THREE.Mesh(artGeometry, new THREE.MeshPhongMaterial({
		color: 0xffffff,
		map: new THREE.TextureLoader().load(url),
		shininess: 50,
	}));
	art.material.map.anisotropy = window.maxAnisotropy;
	art.position.z = 0.001;
	group.add(art);

	const header = new THREE.Mesh(headerGeometry, headerArt);
	header.position.z = 0.001;
	group.add(header);

	const artClone = art.clone();
	artClone.position.z = box.position.z * 2 * 0.85;
	artClone.rotation.y = Math.PI;
	group.add(artClone);
	const headerClone = header.clone();
	headerClone.position.z = box.position.z * 2 * 0.85;
	headerClone.rotation.y = Math.PI;
	group.add(headerClone);*/

	ssrSelects.push(/*header, art, artClone, headerClone,*/ box);

	/*const disclaimer = new THREE.Mesh(disclaimerGeometry, new THREE.MeshStandardMaterial({
		color: 0xffffff,
		roughness: 0.25,
	}));
	disclaimer.position.z = box.position.z * 2 * 0.85;
	group.add(disclaimer);*/
	return group;
}
export default generate;