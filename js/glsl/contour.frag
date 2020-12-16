uniform float focus;

varying float object_distance;
varying vec3 vertex_color;
varying vec4 vertex_position;

void main() {
	float distance = distance(gl_PointCoord, vec2(0.5, 0.5));

	float intensity = abs(mod(vertex_position.y, 1.0));
	intensity = min(intensity, 1.0 - intensity);

	gl_FragColor = vec4(vertex_color, 
		mix(
			3.0 / object_distance, 
			0.0, 
			smoothstep(
				0.0, 
				1.0, 
				pow(intensity * 10.0, 0.3)
			)
		)
	);
}
