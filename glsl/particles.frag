uniform sampler2D positions;
varying vec2 uv_pos;

uniform vec3 a; // offset by a
uniform vec3 b; // scaled by b
uniform vec3 c; // oscillates c times every t
uniform vec3 d; // phase of d

uniform float y_pos;


void main() {

    float alpha = min(1.0, max(0.5, y_pos / 3.2 + 1.0));

    gl_FragColor = vec4(a + b * cos(6.28318 * (c * (texture2D(positions, uv_pos).q * 25.0) + d)), alpha);
}
