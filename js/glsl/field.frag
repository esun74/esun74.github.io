uniform float focus;

varying float object_distance;
varying vec3 vertex_color;

void main() {
	float distance = distance(gl_PointCoord, vec2(0.5, 0.5));
	if (distance > 0.50) {
		discard;
	} else {
		gl_FragColor = mix( vec4(vertex_color, 5.0 / pow(object_distance, 3.0)), 
							vec4(vertex_color, 0.0), 
							smoothstep(0.25, 0.50, distance)
						  );
	}
}