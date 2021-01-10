uniform float focus;
uniform float grid_size;
uniform float grid_width;

varying float object_distance;
varying vec3 vertex_color;
varying vec4 vertex_position;


void main() {

	float f = abs(fract(vertex_position.y * grid_size) - 0.5);
	float df = fwidth(vertex_position.y * grid_size);
	float mi = max(0.0, grid_width - 1.0), ma = max(1.0, grid_width);
	float g = 1.0 - clamp((f - df * mi) / (df * (ma - mi)), max(0.0, 1.0 - grid_width), 1.0);

	gl_FragColor = vec4(vertex_color, 
		mix(
			0.5 / object_distance / 0.2, 
			0.0, 
			1.0 - g
		)
	);

	// gl_FragColor = vec4(vertex_color + (0.05 * object_distance), 1.0);
	// gl_FragColor = vec4(vertex_color, 0.5);

}