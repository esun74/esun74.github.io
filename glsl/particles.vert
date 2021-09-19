uniform sampler2D positions;
uniform float pointSize;
varying vec2 uv_pos;

void main() {
    
    uv_pos = position.st;
    vec3 pos = texture2D(positions, uv_pos).stp;
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = pointSize;

}
