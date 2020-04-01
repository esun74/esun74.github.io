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
// scene.background = new THREE.Color(0x111111);
// scene.fog = new THREE.Fog(0x111111, 0, 0);
scene.background = new THREE.Color(0x000000);
// scene.fog = new THREE.Fog(0x000000, 0, 0);
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;
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

// Dotted Grid Background
//--------------------------------------------------
var cubeWidth = 2
var lineSegments = new THREE.LineSegments(
	grid(cubeWidth, [1, 3, 5]), 
	new THREE.LineDashedMaterial({ 
		// color: 0xffaa00,
		// color: 0xdff4ff,
		color: 0x333333,
		// color: 0x101010,
		dashSize: cubeWidth / 100, 
		gapSize: cubeWidth / 200, 
		scale: .005
}));
lineSegments.computeLineDistances();
lineSegments.material.blending = THREE.AdditiveBlending;
lineSegments.material.transparent = true;
objects.add(lineSegments);
//--------------------------------------------------




// Create points
//--------------------------------------------------
var particles = new THREE.BufferGeometry();

count = 100
positions = new Float32Array(count * 3);
velocity = new Float32Array(count * 3);

material = new THREE.PointsMaterial({
	// color: 0xFFFFFF,
	color: 0xFFAA00, 
	size: 0.05,
	// size: 3.00,
	blending: THREE.AdditiveBlending,
	transparent: true,
	opacity: 0.25,
	// sizeAttenuation: false,
})

material = new THREE.ShaderMaterial({
	uniforms: {
		color: {value: new THREE.Color(0xFFFFFF)}
	},

	vertexShader: `

		varying float object_distance;

		void main() {
			object_distance = -(modelViewMatrix * vec4(position, 1.0)).z;
			gl_PointSize = max(7.0, pow(object_distance / 1.5, 2.0));
			gl_Position = 	projectionMatrix * 
							modelViewMatrix * 
							vec4(position, 1.0);
		}
	`,

	fragmentShader: `
		varying float object_distance;

		void main() {
			// if(length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
			// if((abs(gl_PointCoord.x - 0.5) * 1.0) + (abs(1.0 - gl_PointCoord.y)) * 2.0) discard;
			if(((abs(gl_PointCoord.x - 0.5) > (2.0 * 0.125)) || (abs(gl_PointCoord.y - 0.5) > (sqrt(3.0) * 0.125))) ||
			 (((abs(gl_PointCoord.x - 0.5) * 4.0) + (4.0 / sqrt(3.0) * abs(gl_PointCoord.y - 0.5))) > 1.0)) {
				gl_FragColor = vec4(0.0, 0.0, 1.0, (0.5 - length(gl_PointCoord - vec2(0.5, 0.5))) * min(1.0, 40.0 / pow(object_distance, 2.0)));
			} else {
				gl_FragColor = vec4(0.0, 0.0, 1.0, 40.0 / pow(object_distance, 2.0));
			}

		}
	`,

	transparent: true,
	depthWrite: false,
})

for (var i = 0; i < count * 3; i++) {
	positions[i] = (Math.random() - 0.5) * 10;
	velocity[i] = (Math.random() - 0.5) / 10;
}

particles.addAttribute(
	'position', 
	new THREE.BufferAttribute(positions, 3).setDynamic(true)
);
cloud = new THREE.Points(particles, material);
objects.add(cloud);
//--------------------------------------------------





// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin();
	requestAnimationFrame(animate);

	// objects.position.z = -7.5
	objects.rotation.x = .1;
	objects.rotation.y -= .002;


	renderer.render(scene, camera);
	stats.end();
};
//--------------------------------------------------

// document.body.addEventListener('click', () => {window.location.reload()}, true); 

animate();

