uniform sampler2D positions;
uniform float pointSize;
varying vec2 uv_pos;
varying vec4 uv_rel;

void main() {
    
    uv_pos = position.st;
    vec4 pos = texture2D(positions, uv_pos);
    pos.q = 1.0;
    uv_rel = modelViewMatrix * pos;
 
    gl_Position = projectionMatrix * modelViewMatrix * pos;
    gl_PointSize = pointSize;

}
