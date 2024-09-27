import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass';

import { renderer, scene, camera } from './main';
export const ssrSelects = [];

export default function () {
	const composer = new EffectComposer(renderer);
	const ssrPass = new SSRPass({
		renderer,
		scene,
		camera,
		width: innerWidth,
		height: innerHeight,
		selects: ssrSelects,
	});

	ssrPass.maxDistance = 10;
	ssrPass.blur = true;
	ssrPass.isDistanceAttenuation = true;
	ssrPass.thickness = 0.1;
	ssrPass.isFresnel = true;
	composer.addPass(ssrPass);

	return composer;
}