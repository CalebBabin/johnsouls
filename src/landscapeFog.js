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
            `);

        // shader.fragmentShader = shader.fragmentShader.replace(
        //     'void main()',
        //     `
        //     uniform float u_time;
        //     void main()
        //     `);
        // shader.fragmentShader = shader.fragmentShader.replace(
        //     '#include <map_fragment>',
        //     /*glsl*/`
        //     vec4 sampledDiffuseColor = texture2D( map, vMapUv );

        //     #ifdef DECODE_VIDEO_TEXTURE
        //         // use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)
        //         sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
        //     #endif

        //     diffuseColor *= sampledDiffuseColor;
        //     `);
    }

    window.requestAnimationFrame(tick);

    return material;
}