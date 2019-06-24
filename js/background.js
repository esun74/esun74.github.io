
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
		color: 0x014cc3,
		roughness: 0.5,
		metalness: 0.75,
}));
polygon.position.set(0, 0, 0);
objects.add(polygon)
//--------------------------------------------------


//--------------------------------------------------
var light1 = new THREE.PointLight(0xffffff, 1, 0);
light1.position.set(2, 2, 2);
scene.add(light1);

var light2 = new THREE.PointLight(0xffffff, 1, 0);
light2.position.set(-2, -2, -2);
scene.add(light2);
//--------------------------------------------------


//--------------------------------------------------
var particles = new THREE.BufferGeometry();

var material = new THREE.PointsMaterial( {
	color: 0xFFFFFF,
	size: 3,
	blending: THREE.AdditiveBlending,
	transparent: true,
	sizeAttenuation: false
} );

r = 5

count = 20
positions = []
velocity = []

for (var i = 0; i < count * 3; i++) {
	positions.push(Math.random() * r - r / 2)
	velocity.push(new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1))
}
particles.addAttribute(
	'position', 
	new THREE.Float32BufferAttribute(positions, 3).setDynamic(true)
);
cloud = new THREE.Points(particles, material);
objects.add(cloud);
//--------------------------------------------------


//--------------------------------------------------
var cubeWidth = 2
var lineSegments = new THREE.LineSegments(
	grid(cubeWidth, [1, 3, 5]), 
	new THREE.LineDashedMaterial({ 
		color: 0xdff4ff,//0xffaa00,
		dashSize: cubeWidth / 90, 
		gapSize: cubeWidth / 10, 
		scale: .005
}));
lineSegments.computeLineDistances();
lineSegments.material.color.setHex(0x101010);
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


//--------------------------------------------------
var animate = function () {
	stats.begin();
	requestAnimationFrame(animate);

	objects.rotation.x += .001;
	objects.rotation.y += .002;

	renderer.render(scene, camera);
	stats.end();
};
//--------------------------------------------------


animate();


