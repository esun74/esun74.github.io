import {BufferGeometryUtils} from './js/three.js-master/examples/jsm/utils/BufferGeometryUtils.js';


// Performance Statistics
//--------------------------------------------------
var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
// document.body.addEventListener('click', () => {window.location.reload()}, true)
//--------------------------------------------------

// Dynamic Canvas Sizing
//--------------------------------------------------
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onWindowResize, false)
//--------------------------------------------------

// Setting the Scene
//--------------------------------------------------
var scene = new THREE.Scene()
scene.background = new THREE.Color(0xcccccc)
// scene.background = new THREE.Color(0x222222)
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.z = 10
//--------------------------------------------------

// Mouse Position
//--------------------------------------------------
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
}

window.addEventListener('mousemove', onMouseMove, false)
//--------------------------------------------------

// Configuring the Renderer and adding it to the DOM
//--------------------------------------------------
var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)
//--------------------------------------------------

// Creating a group to hold objects
//--------------------------------------------------
var objects = new THREE.Group()
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


var material = new THREE.MeshLambertMaterial({
		color: 0xcccccc,
		// roughness: 0.5,
		// metalness: 0.75,
		// side: THREE.DoubleSide
})

// var polygon = new THREE.Mesh(new THREE.RingBufferGeometry(-0.01, 10, 32), material)
// polygon.position.set(0, -3, 0)
// polygon.rotateX(Math.PI * -0.5)
// polygon.castShadow = true
// polygon.receiveShadow = true
// objects.add(polygon)

var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(Math.random() * 0.5 + 0.2, Math.random() + 1.0, Math.random() * 0.5 + 0.2), material)
polygon.position.set(1, -2.5, 0)
polygon.castShadow = true
polygon.receiveShadow = true
objects.add(polygon)

var geometries = []
var location_reference = new THREE.Object3D();
location_reference.position.z = -2.5
objects.add(location_reference)

for (var i = 0; i < 10; i++) {
	var geometry = new THREE.BoxBufferGeometry(Math.random() * 0.5 + 0.2, Math.random() + 1.0, Math.random() * 0.5 + 0.2)



	geometries.push(geometry)
}

var merged_geometries = BufferGeometryUtils.mergeBufferGeometries(geometries, false)


var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 0.1, 10), material)
polygon.position.set(1, -3.05, 0)
polygon.castShadow = true
polygon.receiveShadow = true
objects.add(polygon)


var directional_light = new THREE.DirectionalLight(0xFFFFAA, 1, 100)
directional_light.position.set(10, 10, 10)
directional_light.castShadow = true
objects.add(directional_light)

var ambient_light = new THREE.AmbientLight(0xAAAAFF, 0.75)


var polygon = new THREE.Mesh(
	new THREE.SphereBufferGeometry(0.5, 16, 12), 
	new THREE.MeshBasicMaterial({color: 0xFFFFFF,}));
directional_light.add(polygon)


objects.add(ambient_light)




// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	raycaster.setFromCamera(mouse, camera)


	objects.rotation.y += 0.002


	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()