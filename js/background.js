// Performance Statistics
//--------------------------------------------------
var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
//--------------------------------------------------


// Setting the Scene
//--------------------------------------------------
var scene = new THREE.Scene(); 
// scene.background = new THREE.Color(0x111111);
// scene.fog = new THREE.Fog(0x111111, 0, 0);
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 0, 0);
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;
//--------------------------------------------------


// Configuring the Renderer and adding it to the DOM
//--------------------------------------------------
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//--------------------------------------------------


// Creating a group to hold objects
//--------------------------------------------------
var objects = new THREE.Group();
scene.add(objects)
//--------------------------------------------------


// Create center polygon
// MeshBasicMaterial
// MeshDepthMaterial
// MeshDistanceMaterial
// MeshLambertMaterial
// MeshMatcapMaterial
// MeshPhongMaterial
// MeshPhysicalMaterial
// MeshStandardMaterial
// MeshToonMaterial
//--------------------------------------------------
var polygon = new THREE.Mesh(
	new THREE.IcosahedronBufferGeometry(1, 0), 
	new THREE.MeshStandardMaterial({
	// new THREE.MeshPhysicalMaterial({
		color: 0x014CC3,
		roughness: 0.5,
		metalness: 0.75,
}));
polygon.position.set(0, 0, 0);
objects.add(polygon)
//--------------------------------------------------


// Particle Cloud
//--------------------------------------------------
var particles = new THREE.BufferGeometry();

r = 2
count = 50
positions = new Float32Array(count * 3);
velocity = new Float32Array(count * 3);
lights = []

for (var i = 0; i < count * 3; i++) {
	positions[i] = Math.random() * r - r / 2;
	// positions[i] = i / 50
	positions[i] += positions[i] > 0 ? 1 : -1
	velocity[i] = Math.random();
}

particles.addAttribute(
	'position', 
	new THREE.BufferAttribute(positions, 3).setDynamic(true)
);
// particles.addAttribute(
// 	'velocity',
// 	new THREE.BufferAttribute(velocity, 3).setDynamic(true)
// );

// geometry, material
cloud = new THREE.Points(particles, 
	new THREE.PointsMaterial({
		color: 0xFFFFFF,
		// size: .03,
		size: 3,
		blending: THREE.AdditiveBlending,
		transparent: true,
		sizeAttenuation: false
}));
objects.add(cloud);

for (var i = 0; i < count; i++) {
	lights.push(new THREE.PointLight(0xffffff, 2.5 / count, 0));
	lights[lights.length - 1].position.set(
		positions[3 * i + 0], 
		positions[3 * i + 1], 
		positions[3 * i + 2]
	);
	objects.add(lights[lights.length - 1]);
}

//--------------------------------------------------


// Connections
//--------------------------------------------------
var geometry = new THREE.BufferGeometry();

lineLength = 10 * 2
linePositions = new Float32Array(count * 3 * lineLength)
lineColors = new Float32Array(count * 3 * lineLength)

for (var i = 0; i < lineColors.length; i++) {
	lineColors[i] = .5;
}

geometry.addAttribute(
	'position',
	new THREE.BufferAttribute(
		linePositions,
		3
	).setDynamic(true)
);

geometry.addAttribute(
	'color',
	new THREE.BufferAttribute(
		lineColors,
		3
	).setDynamic(true)
);

geometry.computeBoundingSphere();
geometry.setDrawRange(0, 0);

var material = new THREE.LineBasicMaterial({
	vertexColors: THREE.VertexColors,
	blending: THREE.AdditiveBlending,
	transparent: true,
	opacity: 0.2
});
var linesMesh = new THREE.LineSegments(geometry, material);
objects.add(linesMesh);
//--------------------------------------------------


// Dotted Grid Background
//--------------------------------------------------
var cubeWidth = 2
var lineSegments = new THREE.LineSegments(
	grid(cubeWidth, [3, 5]), 
	new THREE.LineDashedMaterial({ 
		// color: 0xffaa00,
		// color: 0xdff4ff,
		color: 0x333333,
		// color: 0x101010,
		dashSize: cubeWidth / 90, 
		gapSize: cubeWidth / 10, 
		scale: .005
}));
lineSegments.computeLineDistances();
lineSegments.material.blending = THREE.AdditiveBlending;
lineSegments.material.transparent = true;
objects.add(lineSegments);
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


// Initializing some variables
//--------------------------------------------------
var g = .05;
var distances = [];
var max_distance = 2;
var alphas = [];
var now = 0;
objects.rotation.x = .2
//--------------------------------------------------


// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin();
	requestAnimationFrame(animate);

	objects.rotation.x += .001;
	objects.rotation.y += .002;
	polygon.rotation.z -= .003;
	polygon.rotation.x -= .004;


	now = 20000 + performance.now();

	if (scene.fog.near < 8) {
		scene.fog.near += .015;
	}
	if (scene.fog.far < 16) {
		scene.fog.far += .025;
	}

	for (var i = 0; i < count; i++) {

		distance = 
			Math.pow(
			Math.pow(positions[3 * i + 0], 2) + 
			Math.pow(positions[3 * i + 1], 2) + 
			Math.pow(positions[3 * i + 2], 2), 1/2);

		positions[3 * i + 0] = distance * Math.sin(now / 2000 * (0.1 + velocity[3 * i + 0])) * Math.cos(now / 5000 * (velocity[3 * i + 1] * .1));
		positions[3 * i + 1] = distance * Math.sin(now / 2000 * (0.1 + velocity[3 * i + 0])) * Math.sin(now / 5000 * (velocity[3 * i + 1] * .1));
		positions[3 * i + 2] = distance * Math.cos(now / 2000 * (0.1 + velocity[3 * i + 0]));


		lights[i].position.set(
			positions[3 * i + 0], 
			positions[3 * i + 1], 
			positions[3 * i + 2]
		)

		distances = [];
		alphas = [];

		for (var a = 0; a < count; a++) {
			distance2 = Math.sqrt(
							Math.pow(positions[3 * i + 0] - positions[3 * a + 0], 2) + 
							Math.pow(positions[3 * i + 1] - positions[3 * a + 1], 2) + 
							Math.pow(positions[3 * i + 2] - positions[3 * a + 2], 2)
						)
			if (a != i && distance2 < max_distance) {
				if (distances.length == 0) {
					distances[0] = a;
					alphas[0] = 1.0 - (distance2 / max_distance);
				} else {
					for (var b = 0; b < count; b++) {
						if (distance2 < Math.sqrt(
								Math.pow(positions[3 * i + 0] - positions[3 * distances[b] + 0], 2) + 
								Math.pow(positions[3 * i + 1] - positions[3 * distances[b] + 1], 2) + 
								Math.pow(positions[3 * i + 2] - positions[3 * distances[b] + 2], 2)
							)
						) {
							distances.splice(b, 0, a);
							alphas.splice(b, 0, 1.0 - (distance2 / max_distance));
							break;
						}
					}
					if (b == count) {
						distances.push(a);
						alphas.push(1.0 - (distance2 / max_distance));
					}
				}
			}
		}

		for (var a = 0; a < lineLength / 2; a++) {
			if (a < distances.length) {
				linePositions[6 * (a + (i * lineLength / 2)) + 0] = positions[3 * distances[a] + 0];
				linePositions[6 * (a + (i * lineLength / 2)) + 1] = positions[3 * distances[a] + 1];
				linePositions[6 * (a + (i * lineLength / 2)) + 2] = positions[3 * distances[a] + 2];
				linePositions[6 * (a + (i * lineLength / 2)) + 3] = positions[3 * i + 0];
				linePositions[6 * (a + (i * lineLength / 2)) + 4] = positions[3 * i + 1];
				linePositions[6 * (a + (i * lineLength / 2)) + 5] = positions[3 * i + 2];
				for (var b = 0; b < 6; b++) {
					lineColors[6 * (a + (i * lineLength / 2)) + b] = alphas[a];
				}

			} else {
				for (var b = 0; b < 6; b++) {
					linePositions[6 * (a + (i * lineLength / 2)) + b] = 0
				}
			}

		}
	}


	cloud.geometry.attributes.position.needsUpdate = true;

	linesMesh.geometry.setDrawRange(0, 1000000)

	linesMesh.geometry.attributes.position.needsUpdate = true;
	linesMesh.geometry.attributes.color.needsUpdate = true;

	

	renderer.render(scene, camera);
	stats.end();

};
//--------------------------------------------------

// document.body.addEventListener('click', () => {window.location.reload()}, true); 

animate();