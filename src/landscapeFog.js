import { AdditiveBlending } from "three";

export function applyLandscapeFog(material) {
    let uniforms;

    function tick() {
        if (uniforms) {
            uniforms.u_time.value = performance.now() / 1000;
        }
        window.requestAnimationFrame(tick);
    };

    material.opacity = 0.8;
    // material.blending = AdditiveBlending;
    material.transparent = true;

    material.onBeforeCompile = function (shader) {
        if (!shader.uniforms) shader.uniforms = {};
        shader.uniforms.u_time = { value: Math.random() * 1000 };
        uniforms = shader.uniforms;
        tick();
        material.userData.shader = shader;
        shader.vertexShader = shader.vertexShader.replace(
            'void main()',
            `
            uniform float u_time;
            varying vec3 vPos;
            void main()
            `);
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            /*glsl*/`
            #include <begin_vertex>
            float displaceScale = 50.0;
            float fogDisplacement = sin(u_time * 0.02 - position.x * displaceScale - position.y * displaceScale);
            fogDisplacement = fogDisplacement * 0.5 + 0.5;
            fogDisplacement *= 0.01;
            transformed.y += fogDisplacement;

            vMapUv.x -= (u_time * 0.01);
            vPos = position;
            `);

        shader.fragmentShader = shader.fragmentShader.replace(
            'void main()',
            `
            uniform float u_time;
            varying vec3 vPos;
            void main()
            `);
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            /*glsl*/`
            #include <map_fragment>

            float fogStart = 0.05;
            float fogEnd = 0.18;

            float customFog = smoothstep(fogEnd, fogStart, vPos.y);
            diffuseColor.a *= pow(customFog, 2.0);
            // diffuseColor.a = floor(customFog * 2.0) - 1.0;
            `);
    }

    window.requestAnimationFrame(tick);

    return material;
}