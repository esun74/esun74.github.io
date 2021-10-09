uniform sampler2D positions;
varying vec2 uv_pos;
varying vec4 uv_rel;

uniform vec3 a; // offset by a
uniform vec3 b; // scaled by b
uniform vec3 c; // oscillates c times every t
uniform vec3 d; // phase of d

uniform float y_pos;


void main() {

    vec4 pos = texture2D(positions, uv_pos);

    gl_FragColor = vec4(a + b * cos(6.28318 * (c * pos.q * 25.0 + d)), 
        min(1.0, max(0.1,
            floor(fract(((uv_rel.x * 50.0) + 100.0) * uv_pos.x) + 0.5) *
            floor(fract(((uv_rel.y * 50.0) + 100.0) * uv_pos.y) + 0.5) *
            floor(fract(pos.q + uv_pos.x + uv_pos.y) + 0.75) - (y_pos / 1.6)
        ) * uv_rel.z * -0.25)
    );
}
