
//--------------------------------------------------
var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
//--------------------------------------------------


//--------------------------------------------------
var scene = new THREE.Scene(); 
scene.background = new THREE.Color(0x111111);
// scene.fog = new THREE.Fog(0x111111, 3, 6);
//--------------------------------------------------


//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;
//--------------------------------------------------


//--------------------------------------------------
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//--------------------------------------------------


//--------------------------------------------------
var objects = new THREE.Group();
scene.add(objects)
//--------------------------------------------------


//--------------------------------------------------
var polygon = new THREE.Mesh(
	new THREE.IcosahedronBufferGeometry(1, 0), 
	new THREE.MeshStandardMaterial({
		color: 0x014CC3,
		roughness: 0.5,
		metalness: 0.75,
}));
polygon.position.set(0, 0, 0);
objects.add(polygon)
//--------------------------------------------------


//--------------------------------------------------
var particles = new THREE.BufferGeometry();

r = 2
count = 100
positions = new Float32Array(count * 3);
velocity = new Float32Array(count * 3);
lights = []

for (var i = 0; i < count * 3; i++) {
	positions[i] = Math.random() * r - r / 2;
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

cloud = new THREE.Points(particles, 
	new THREE.PointsMaterial({
		color: 0xFFFFFF,
		size: .03,
		blending: THREE.AdditiveBlending,
		transparent: true,
		// sizeAttenuation: false
}));
objects.add(cloud);

for (var i = 0; i < count; i++) {
	lights.push(new THREE.PointLight(0xffffff, .025, 0))
	lights[lights.length - 1].position.set(
		positions[3 * i + 0], 
		positions[3 * i + 1], 
		positions[3 * i + 2]
	)
	objects.add(lights[lights.length - 1])
}

//--------------------------------------------------


//--------------------------------------------------

//--------------------------------------------------


//--------------------------------------------------
var cubeWidth = 2
var lineSegments = new THREE.LineSegments(
	grid(cubeWidth, [3, 5]), 
	new THREE.LineDashedMaterial({ 
		// color: 0xffaa00,
		// color: 0xdff4ff,
		color: 0x101010,
		dashSize: cubeWidth / 90, 
		gapSize: cubeWidth / 10, 
		scale: .005
}));
lineSegments.computeLineDistances();
lineSegments.material.blending = THREE.AdditiveBlending;
lineSegments.material.transparent = true;
objects.add(lineSegments)
//--------------------------------------------------


//--------------------------------------------------
//--------------------------------------------------


//--------------------------------------------------
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);
//--------------------------------------------------

var g = .05;

//--------------------------------------------------
var animate = function () {
	stats.begin();
	requestAnimationFrame(animate);

	objects.rotation.x += .001;
	objects.rotation.y += .002;



	for (var i = 0; i < count; i++) {

		distance = 
			Math.pow(
			Math.pow(positions[3 * i + 0], 2) + 
			Math.pow(positions[3 * i + 1], 2) + 
			Math.pow(positions[3 * i + 2], 2), 1/2);


		// ratio = 1 / distance
		// positions[3 * i + 0] += g * (2 - distance) * positions[3 * i + 0] / distance;
		// positions[3 * i + 1] += g * (2 - distance) * positions[3 * i + 1] / distance;
		// positions[3 * i + 2] += g * (2 - distance) * positions[3 * i + 2] / distance;

		// for (var ii = 0; ii < count; ii++) {
		// 	if (i != ii) {
		// 		distance = 
		// 			Math.pow(positions[3 * ii + 0] - positions[3 * i + 0], 2) + 
		// 			Math.pow(positions[3 * ii + 1] - positions[3 * i + 1], 2) + 
		// 			Math.pow(positions[3 * ii + 2] - positions[3 * i + 2], 2);

		// 		if (distance < 1 && distance > .25) {
		// 			positions[3 * i + 0] += g * g * g * (positions[3 * ii + 0] - positions[3 * i + 0]) / distance;
		// 			positions[3 * i + 1] += g * g * g * (positions[3 * ii + 1] - positions[3 * i + 1]) / distance;
		// 			positions[3 * i + 2] += g * g * g * (positions[3 * ii + 2] - positions[3 * i + 2]) / distance;
		// 		}
		// 	}

		// }


		positions[3 * i + 0] = distance * Math.sin(performance.now() / 1000 * (0.1 + velocity[3 * i + 0])) * Math.cos(performance.now() / 10000 * velocity[3 * i + 1]);
		positions[3 * i + 1] = distance * Math.sin(performance.now() / 1000 * (0.1 + velocity[3 * i + 0])) * Math.sin(performance.now() / 10000 * velocity[3 * i + 1]);
		positions[3 * i + 2] = distance * Math.cos(performance.now() / 1000 * (0.1 + velocity[3 * i + 0]));
		// velocity[3 * i + 2] + (i % 4) * velocity[3 * i + 0] - (i % 2) * velocity[3 * i + 2];

		lights[i].position.set(
			positions[3 * i + 0], 
			positions[3 * i + 1], 
			positions[3 * i + 2]
		)
	}



	cloud.geometry.attributes.position.needsUpdate = true;

	renderer.render(scene, camera);
	stats.end();
};
//--------------------------------------------------


animate();


