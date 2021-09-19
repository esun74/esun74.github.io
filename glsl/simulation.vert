varying vec2 uv_pos;

void main() {
    uv_pos = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}