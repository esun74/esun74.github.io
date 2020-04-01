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

// Create points
//--------------------------------------------------
var particles = new THREE.BufferGeometry();

r = 2
count = 3
positions = new Float32Array(count * 3);
velocity = new Float32Array(count * 3);

material = new THREE.PointsMaterial({
	// color: 0xFFFFFF,
	color: 0xFFAA00, 
	// size: 0.05,
	size: 3.00,
	blending: THREE.AdditiveBlending,
	transparent: true,
	opacity: 0.5,
	sizeAttenuation: false,
})

for (var i = 0; i < count * 3; i++) {
	positions[i] = Math.random() * r - r / 2;
	positions[i] += positions[i] > 0 ? 1 : -1
	velocity[i] = (Math.random() - 0.5) / 10;
}

particles.addAttribute(
	'position', 
	new THREE.BufferAttribute(positions, 3).setDynamic(true)
);
cloud = new THREE.Points(particles, material);
objects.add(cloud);
//--------------------------------------------------

gravitons = [
				-1, -1, -1, .01,
				+1, -1, +1, .01,
				-1, +1, +1, .01,
				// -2, -2, -2, .01,
				// -2, -2, +2, .01,
				// -2, +2, -2, .01,
				// -2, +2, +2, .01,
				// +2, -2, -2, .01,
				// +2, -2, +2, .01,
				// +2, +2, -2, .01,
				// +2, +2, +2, .01,
			]


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

// temp line

// geometry
var MAX_POINTS = 200
var geometries = Array.from({length: count}, () => new THREE.BufferGeometry())
var geometry_points = Array.from({length: count}, () => new Float32Array(MAX_POINTS * 3))
var material = new THREE.LineBasicMaterial({
	color: 0xFFAA00,
	linewidth: 100,
})
var geometry_lines = []


for (var i = 0; i < count; i++) {
	for (var j = 0; j < MAX_POINTS * 3; j++) {
		geometry_points[i][j] = 0
	}
	geometries[i].addAttribute('position', new THREE.BufferAttribute(geometry_points[i], 3))

	geometry_lines.push(new THREE.Line(geometries[i], material))
	objects.add(geometry_lines[i])
}


// var geometry = new THREE.BufferGeometry()

// ps = new Float32Array(MAX_POINTS * 3)
// for (var i = 0; i < MAX_POINTS * 3; i++) {
// 	ps[i] = 0
// }
// geometry.addAttribute('position', new THREE.BufferAttribute(ps, 3))

// // material


// // line
// line = new THREE.Line(geometry, material)
// objects.add(line)



// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin();
	requestAnimationFrame(animate);

	objects.rotation.x = .1;
	objects.rotation.y -= .002;

	for (var i = 0; i < count; i++) {

		acceleration = [0, 0, 0]

		for (var j = 0; j < (gravitons.length / 4); j++) {

			distance_squared = (
					Math.pow(gravitons[4 * j + 0] - positions[3 * i + 0], 2) + 
					Math.pow(gravitons[4 * j + 1] - positions[3 * i + 1], 2) + 
					Math.pow(gravitons[4 * j + 2] - positions[3 * i + 2], 2)
				)

			acceleration[0] += gravitons[4 * j + 3] * (gravitons[4 * j + 0] - positions[3 * i + 0]) / distance_squared
			acceleration[1] += gravitons[4 * j + 3] * (gravitons[4 * j + 1] - positions[3 * i + 1]) / distance_squared
			acceleration[2] += gravitons[4 * j + 3] * (gravitons[4 * j + 2] - positions[3 * i + 2]) / distance_squared
		}

		for (var j = 0; j < count; j++) {
			if (i != j) {
				distance_squared = (
						Math.pow(positions[3 * j + 0] - positions[3 * i + 0], 2) + 
						Math.pow(positions[3 * j + 1] - positions[3 * i + 1], 2) + 
						Math.pow(positions[3 * j + 2] - positions[3 * i + 2], 2)
					)

				acceleration[0] += -.01 * (positions[3 * j + 0] - positions[3 * i + 0]) / distance_squared
				acceleration[1] += -.01 * (positions[3 * j + 1] - positions[3 * i + 1]) / distance_squared
				acceleration[2] += -.01 * (positions[3 * j + 2] - positions[3 * i + 2]) / distance_squared
			}
		}

		for (var j = 0; j < geometry_points[i].length - 3; j++) {
			if ((geometry_points[i][j] == 0) && (geometry_points[i][j + 2] == 0)) {
				geometry_lines[i].geometry.setDrawRange(j / 3, geometry_points[i].length / 3);
			}
			geometry_points[i][j] = geometry_points[i][j + 3]
		}
		geometry_points[i][geometry_points[i].length - 3] = positions[3 * i + 0]
		geometry_points[i][geometry_points[i].length - 2] = positions[3 * i + 1]
		geometry_points[i][geometry_points[i].length - 1] = positions[3 * i + 2]

		geometry_lines[i].geometry.attributes.position.needsUpdate = true;

		velocity[3 * i + 0] += acceleration[0] - (.1 * Math.pow(velocity[3 * i + 0], 2) * Math.sign(velocity[3 * i + 0]))
		velocity[3 * i + 1] += acceleration[1] - (.1 * Math.pow(velocity[3 * i + 1], 2) * Math.sign(velocity[3 * i + 1]))
		velocity[3 * i + 2] += acceleration[2] - (.1 * Math.pow(velocity[3 * i + 2], 2) * Math.sign(velocity[3 * i + 2]))


		positions[3 * i + 0] += velocity[3 * i + 0];
		positions[3 * i + 1] += velocity[3 * i + 1];
		positions[3 * i + 2] += velocity[3 * i + 2];

	}

	cloud.geometry.attributes.position.needsUpdate = true;

	renderer.render(scene, camera);
	stats.end();
};
//--------------------------------------------------

// document.body.addEventListener('click', () => {window.location.reload()}, true); 

animate();

