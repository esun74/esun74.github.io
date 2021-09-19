uniform sampler2D positions;
varying vec2 uv_pos;

uniform vec3 a; // offset by a
uniform vec3 b; // scaled by b
uniform vec3 c; // oscillates c times every t
uniform vec3 d; // phase of d


void main() {
    gl_FragColor = vec4(a + b * cos(6.28318 * (c * (texture2D(positions, uv_pos).q * 15.0) + d)), 0.75);
}