document.body.addEventListener('click', () => {window.location.reload()}, true); 

// Performance Statistics
//--------------------------------------------------
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
//--------------------------------------------------

// Dynamic Canvas Sizing
//--------------------------------------------------
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);
//--------------------------------------------------

// Setting the Scene
//--------------------------------------------------
var scene = new THREE.Scene(); 
scene.background = new THREE.Color(0x111111);
// scene.background = new THREE.Color(0x000000);
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 10;
//--------------------------------------------------

// Mouse Position
//--------------------------------------------------
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener( 'mousemove', onMouseMove, false );
//--------------------------------------------------

// Configuring the Renderer and adding it to the DOM
//--------------------------------------------------
var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//--------------------------------------------------

// Creating a group to hold objects
//--------------------------------------------------
var objects = new THREE.Group();
scene.add(objects)
//--------------------------------------------------

// Points
//--------------------------------------------------
count = 1000
positions = new Float32Array(count * 3);
velocity = new Float32Array(count * 3);

for (var i = 0; i < count * 3; i++) {
	positions[i] = (Math.random() - 0.5) * 20;
	velocity[i] = (Math.random() - 0.5) / 10;
}

material = new THREE.ShaderMaterial({
	uniforms: {
		color: {value: new THREE.Color(0x40FFC0)}
	},

	vertexShader: `
		uniform vec3 color;
		varying float object_distance;

		void main() {
			object_distance = -(modelViewMatrix * vec4(position, 1.0)).z;
			gl_PointSize = max(10.0, pow(object_distance / 1.5, 2.0));
			gl_Position = 	projectionMatrix * 
							modelViewMatrix * 
							vec4(position, 1.0);
		}
	`,

	fragmentShader: `
		uniform vec3 color;
		varying float object_distance;

		void main() {
			if(((abs(gl_PointCoord.x - 0.5) > (4.0)) || (abs(gl_PointCoord.y - 0.5) > (sqrt(3.0) / 8.0))) ||
			 (((abs(gl_PointCoord.x - 0.5) * 4.0) + (4.0 / sqrt(3.0) * abs(gl_PointCoord.y - 0.5))) > 1.0)) {
				gl_FragColor = vec4(color, (0.5 - length(gl_PointCoord - vec2(0.5, 0.5))) * min(1.0, 7.5 / pow(object_distance, 2.50)));
			} else {
				gl_FragColor = vec4(color, 7.5 / pow(object_distance, 2.25));
			}

		}
	`,

	transparent: true,
	depthWrite: false,
})

// material = new THREE.PointsMaterial({
// 	color: 0xFFFFFF,
// 	size: 3.00,
// 	blending: THREE.AdditiveBlending,
// 	transparent: true,
// 	opacity: 0.5,
// 	sizeAttenuation: false,
// })


var particles = new THREE.BufferGeometry();
particles.addAttribute(
	'position', 
	new THREE.BufferAttribute(positions, 3).setDynamic(true)
);
var cloud = new THREE.Points(particles, material)
objects.add(cloud);
//--------------------------------------------------

// Lines
//--------------------------------------------------
var count = 3
var line_length = 20
var geometries = Array.from({length: count}, () => new THREE.BufferGeometry())
var geometry_points = Array.from({length: count}, () => new Float32Array(line_length * 3))
var geometry_velocities = Array.from({length: count}, () => new Float32Array(line_length * 3))
var material = new THREE.LineBasicMaterial({
	color: 0xFFAA00,
	linewidth: 100,
})
var geometry_lines = []


for (var i = 0; i < count; i++) {
	for (var j = 0; j < line_length; j++) {
		geometry_points[i][3 * j + 0] = (Math.random() - 0.5)
		geometry_points[i][3 * j + 1] = 10 - j
		geometry_points[i][3 * j + 2] = (Math.random() - 0.5)
	}
	geometries[i].addAttribute('position', new THREE.BufferAttribute(geometry_points[i], 3))
	geometries[i].addAttribute('velocity', new THREE.BufferAttribute(geometry_velocities[i], 3))

	geometry_lines.push(new THREE.Line(geometries[i], material))
	objects.add(geometry_lines[i])
}
//--------------------------------------------------


// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin();
	requestAnimationFrame(animate);
	raycaster.setFromCamera(mouse, camera);

	objects.rotation.x = Math.min(0.5, Math.max(-0.5, (objects.rotation.x + ((Math.sign(objects.rotation.x) == Math.sign(mouse.y) ? (0.5 - Math.abs(objects.rotation.x)) : (0.5)) * mouse.y * 0.01))))
	objects.rotation.y = Math.min(0.5, Math.max(-0.5, (objects.rotation.y - ((Math.sign(objects.rotation.y) != Math.sign(mouse.x) ? (0.5 - Math.abs(objects.rotation.y)) : (0.5)) * mouse.x * 0.01))))







	renderer.render(scene, camera);
	stats.end();
};
//--------------------------------------------------

animate();