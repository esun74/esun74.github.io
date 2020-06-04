// Performance Statistics
//--------------------------------------------------
var stats = new Stats()
stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
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
scene.background = new THREE.Color(0xCCCCCC)
// scene.background = new THREE.Color(0x222222)
// scene.fog = new THREE.Fog(0xCCCCCC, 5, 15);
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.x = 10
camera.rotation.y = Math.PI / 2
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
renderer.shadowMapCullFace = THREE.CullFaceBack
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




// Platform
//--------------------------------------------------
var concrete_material = new THREE.MeshLambertMaterial({
		color: 0xBBBBBB,
})
var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 50, 50), concrete_material)
polygon.position.set(-0.50, 0, 0)
polygon.receiveShadow = true
objects.add(polygon)
//--------------------------------------------------

// Outline
//--------------------------------------------------
var ring_material = new THREE.MeshLambertMaterial({
		color: 0xF0E68C,
})

var ring_geometry = new THREE.Geometry()
for (var i = 0; i < 8; i++) {
	ring_geometry.merge(new THREE.RingGeometry(4.0, 4.5, 8, 1, (Math.PI / 4) * i + 0.025, (Math.PI / 4) - 0.05))
}


var polygon = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(ring_geometry), ring_material)
polygon.position.set(-0.2, 0, 0)
polygon.rotation.set(0, Math.PI / 2, 0)
polygon.receiveShadow = true
objects.add(polygon)
//--------------------------------------------------

// Loop
//--------------------------------------------------
var loop_material = new THREE.MeshLambertMaterial({
		color: 0x6D6D6D,
})
var loop_geometry = new THREE.Geometry()
loop_geometry.merge(new THREE.TorusGeometry(3.0, 0.015, 6, 64, Math.PI * 1.96))
loop_geometry.rotateZ(Math.PI / 2 + 0.04)

var pole_locations = [0, 1/6, 2.5/6, 3.5/6, 5/6, 6/6, 7/6, 8.5/6, 9.5/6, 11/6]

for (var i = 0; i < pole_locations.length; i++) {
	var pole_geometry = new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6, 1, true)
	pole_geometry.translate(3, -0.5, -0.075)
	pole_geometry.rotateX(Math.PI / 2)
	pole_geometry.merge(new THREE.TorusGeometry(3.0, 0.035, 6, 16, Math.PI / 64))

	pole_geometry.rotateZ(Math.PI * pole_locations[i] - 0.05)
	loop_geometry.merge(pole_geometry)
}

var polygon = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(loop_geometry), loop_material)
polygon.position.set(0, 0, 0)
polygon.rotation.set(0, Math.PI / 2, 0.025)
polygon.castShadow = true
polygon.receiveShadow = true
objects.add(polygon)
//--------------------------------------------------


// Markers
//--------------------------------------------------
var marker_material = new THREE.MeshLambertMaterial({
		color: 0xFFFFFF,
})

var marker_geometry = new THREE.Geometry()

var pole_geometry = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6, 1, false)
pole_geometry.translate(0, 0.25, 0)
pole_geometry.rotateZ(Math.PI / 2)
marker_geometry.merge(pole_geometry)


var mark_locations = [1/6, 2/6, 4/6, 5/6, 7/6, 8/6, 10/6, 11/6]
for (var i = 0; i < mark_locations.length; i++) {
	var mark_geometry = new THREE.BoxGeometry(0.025, 0.4, 0.12)
	mark_geometry.translate(0.075, 3.125, 0)
	mark_geometry.rotateX(Math.PI * mark_locations[i])
	marker_geometry.merge(mark_geometry)

	var mark_geometry = new THREE.BoxGeometry(0.025, 0.1, 0.1)
	mark_geometry.translate(-0.45, 1.7, 0)
	mark_geometry.rotateX(Math.PI * mark_locations[i])
	marker_geometry.merge(mark_geometry)
}


var mark_locations = [3/6, 6/6, 9/6]
for (var i = 0; i < mark_locations.length; i++) {
	var mark_geometry = new THREE.BoxGeometry(0.025, 0.6, 0.15)
	mark_geometry.translate(0.075, 3.2, 0)
	mark_geometry.rotateX(Math.PI * mark_locations[i])
	marker_geometry.merge(mark_geometry)

	var mark_geometry = new THREE.BoxGeometry(0.025, 0.1, 0.1)
	mark_geometry.translate(-0.45, 1.7, 0)
	mark_geometry.rotateX(Math.PI * mark_locations[i])
	marker_geometry.merge(mark_geometry)
}


var mark_locations = [0/6]
for (var i = 0; i < mark_locations.length; i++) {
	var mark_geometry = new THREE.BoxGeometry(0.025, 1.2, 0.15)
	mark_geometry.translate(0.000, 3.1, -0.12)
	mark_geometry.rotateX(Math.PI * mark_locations[i])
	marker_geometry.merge(mark_geometry)

	var mark_geometry = new THREE.BoxGeometry(0.025, 1.2, 0.15)
	mark_geometry.translate(0.000, 3.1, +0.12)
	mark_geometry.rotateX(Math.PI * mark_locations[i])
	marker_geometry.merge(mark_geometry)

	var mark_geometry = new THREE.BoxGeometry(0.025, 0.12, 0.12)
	mark_geometry.translate(-0.45, 1.7, -0.1)
	mark_geometry.rotateX(Math.PI * mark_locations[i])
	marker_geometry.merge(mark_geometry)

	var mark_geometry = new THREE.BoxGeometry(0.025, 0.12, 0.12)
	mark_geometry.translate(-0.45, 1.7, +0.1)
	mark_geometry.rotateX(Math.PI * mark_locations[i])
	marker_geometry.merge(mark_geometry)
}


var polygon = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(marker_geometry), marker_material)
// polygon.position.set(0, 0, 0)
// polygon.rotation.set(0, Math.PI / 2, 0)
polygon.castShadow = true
polygon.receiveShadow = true
objects.add(polygon)

//--------------------------------------------------



// Hand
//--------------------------------------------------

var marker_material = new THREE.MeshLambertMaterial({
		color: 0xCCCCCC,
})

var marker_geometry = new THREE.Geometry()

var pole_geometry = new THREE.CylinderGeometry(0.125, 0.125, 0.01, 6, 1, false)
pole_geometry.translate(0, -0.195, 0)
pole_geometry.rotateZ(Math.PI / 2)
pole_geometry.rotateX(Math.PI / 2)
marker_geometry.merge(pole_geometry)

var polygon = new THREE.Mesh(marker_geometry, marker_material)
objects.add(polygon)


//--------------------------------------------------



// Grid
//--------------------------------------------------


var grid_material = new THREE.MeshLambertMaterial({
		color: 0x777777,
})

var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(.01, 18, .01), grid_material)
polygon.position.set(-0.35, 0, +5.25)
objects.add(polygon)

var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(.01, 18, .01), grid_material)
polygon.position.set(-0.35, 0, -5.25)
objects.add(polygon)

var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(.01, .01, 18), grid_material)
polygon.position.set(-0.35, +1.75, 0)
objects.add(polygon)

var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(.01, .01, 18), grid_material)
polygon.position.set(-0.35, +5.25, 0)
objects.add(polygon)

var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(.01, .01, 18), grid_material)
polygon.position.set(-0.35, -1.75, 0)
objects.add(polygon)

var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(.01, .01, 18), grid_material)
polygon.position.set(-0.35, -5.25, 0)
objects.add(polygon)
//--------------------------------------------------



// Orbit Controls
//--------------------------------------------------
import {OrbitControls} from './OrbitControls.js'
var controls = new OrbitControls(camera, renderer.domElement)
controls.maxPolarAngle = Math.PI / 2
//--------------------------------------------------



// Sky Shader
//--------------------------------------------------
import {Sky} from './Sky.js'
var sky = new Sky()
sky.scale.setScalar(450000)
objects.add(sky)

var inclination = 1.1
var azimuth = 0.15	
var sun_distance = 400000;

sky.material.uniforms["turbidity"].value = 10;
sky.material.uniforms["rayleigh"].value = 2;
sky.material.uniforms["mieCoefficient"].value = 0.005;
sky.material.uniforms["mieDirectionalG"].value = 0.8;
sky.material.uniforms["luminance"].value = 1;
//--------------------------------------------------



// Lights
//--------------------------------------------------
var directional_light = new THREE.DirectionalLight(0xFFFFFF, 0.75)
directional_light.castShadow = true
directional_light.shadow.mapSize.width = 2048
directional_light.shadow.mapSize.height = 2048
directional_light.shadow.mapSize.width = 4096
directional_light.shadow.mapSize.height = 4096
directional_light.shadow.camera.near = sun_distance - 100
directional_light.shadow.camera.far = sun_distance + 100
directional_light.shadow.bias = - 0.0001;

objects.add(directional_light)

var ambient_light = new THREE.AmbientLight(0xFFFFFF, 0.00)
objects.add(ambient_light)
//--------------------------------------------------







// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	raycaster.setFromCamera(mouse, camera)


	// Set Sun Position
	//--------------------------------------------------
	inclination = (inclination % 1 + 1) + 0.001

	console.log(inclination)

	var theta = -Math.PI * ((inclination))
	var phi = 2 * Math.PI * azimuth;

	directional_light.position.x = sun_distance * Math.cos(phi);
	directional_light.position.y = sun_distance * Math.sin(phi) * Math.sin(theta);
	directional_light.position.z = sun_distance * Math.sin(phi) * Math.cos(theta);

	directional_light.intensity = Math.min(directional_light.position.y / 100000, 1.0)
	ambient_light.intensity = directional_light.intensity / 3
	sky.material.uniforms["sunPosition"].value.copy(directional_light.position)
	//--------------------------------------------------


	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()