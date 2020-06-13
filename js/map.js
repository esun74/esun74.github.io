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
camera.position.x = 5.0
camera.rotation.y = Math.PI / 2
camera.rotation.z = Math.PI / 64
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
		color: 0xFDE76A,
})

var ring_geometry = new THREE.Geometry()
for (var i = 0; i < 8; i++) {
	ring_geometry.merge(new THREE.RingGeometry(4.0, 4.5, 8, 1, (Math.PI / 4) * i + 0.025, (Math.PI / 4) - 0.05))
}


var polygon = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(ring_geometry), ring_material)
polygon.position.set(-0.425, 0, 0)
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
pole_geometry.translate(0, 0.29, 0)
pole_geometry.rotateZ(Math.PI / 2)
marker_geometry.merge(pole_geometry)


var mark_locations = [1/6, 2/6, 4/6, 5/6, 7/6, 8/6, 10/6, 11/6]
for (var i = 0; i < mark_locations.length; i++) {
	var mark_geometry = new THREE.BoxGeometry(0.025, 0.4, 0.12)
	mark_geometry.translate(0.025, 3.125, 0)
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
	mark_geometry.translate(0.025, 3.2, 0)
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
polygon.castShadow = true
polygon.receiveShadow = true
objects.add(polygon)

//--------------------------------------------------



// Center
//--------------------------------------------------
var marker_material = new THREE.MeshLambertMaterial({
		color: 0xCCCCCC,
})

var marker_geometry = new THREE.Geometry()

var pole_geometry = new THREE.CylinderGeometry(0.125, 0.125, 0.01, 8, 1, false)
pole_geometry.translate(0, -0.195, 0)
pole_geometry.rotateZ(Math.PI / 2)
pole_geometry.rotateX(Math.PI / 2)
marker_geometry.merge(pole_geometry)

var polygon = new THREE.Mesh(marker_geometry, marker_material)
objects.add(polygon)
//--------------------------------------------------



// Hands
//--------------------------------------------------

var hand_primary_material = new THREE.MeshLambertMaterial({
		color: 0xFFFFFF,
})

var hand_secondary_material = new THREE.MeshLambertMaterial({
		color: 0xFDE76A,
})


var hand_geometry = new THREE.BufferGeometry()
hand_geometry.addAttribute('position', new THREE.BufferAttribute(Float32Array.from([

	+0.18, -0.75, +0.16,
	+0.18, +3.50, -0.10,
	+0.18, +3.50, +0.10,

	+0.18, +3.50, -0.10,
	+0.18, -0.75, +0.16,
	+0.18, -0.75, -0.16,


	+0.14, +3.50, +0.10,
	+0.14, +3.50, -0.10,
	+0.14, -0.75, +0.16,

	+0.14, -0.75, -0.16,
	+0.14, -0.75, +0.16,
	+0.14, +3.50, -0.10,


	+0.14, +3.50, -0.10,
	+0.18, +3.50, -0.10,
	+0.18, -0.75, -0.16,

	+0.14, +3.50, -0.10,
	+0.18, -0.75, -0.16,
	+0.14, -0.75, -0.16,


	+0.18, -0.75, +0.16,
	+0.18, +3.50, +0.10,
	+0.14, +3.50, +0.10,

	+0.14, -0.75, +0.16,
	+0.18, -0.75, +0.16,
	+0.14, +3.50, +0.10,


	+0.14, -0.75, -0.16,
	+0.18, -0.75, +0.16,
	+0.14, -0.75, +0.16,

	+0.18, -0.75, +0.16,
	+0.14, -0.75, -0.16,
	+0.18, -0.75, -0.16,


	+0.14, +3.50, +0.10,
	+0.18, +3.50, +0.10,
	+0.14, +3.50, -0.10,

	+0.18, +3.50, -0.10,
	+0.14, +3.50, -0.10,
	+0.18, +3.50, +0.10,

]), 3))
hand_geometry.computeVertexNormals()

var hour_pointer = new THREE.Mesh(hand_geometry, hand_primary_material)
hour_pointer.castShadow = true
hour_pointer.receiveShadow = true

var hand_detail_geometry = new THREE.BufferGeometry()
hand_detail_geometry.addAttribute('position', new THREE.BufferAttribute(Float32Array.from([

	+0.20, +2.45, +0.06,
	+0.20, +3.40, -0.04,
	+0.20, +3.40, +0.04,

	+0.20, +3.40, -0.04,
	+0.20, +2.45, +0.06,
	+0.20, +2.45, -0.06,

]), 3))
hand_detail_geometry.computeVertexNormals()

var hour_detail = new THREE.Mesh(hand_detail_geometry, hand_secondary_material)



var hour_hand = new THREE.Group()
hour_hand.add(hour_pointer)
hour_hand.add(hour_detail)
objects.add(hour_hand)



var hand_geometry = new THREE.BufferGeometry()
hand_geometry.addAttribute('position', new THREE.BufferAttribute(Float32Array.from([

	+0.12, -0.65, +0.16,
	+0.12, +2.40, -0.14,
	+0.12, +2.40, +0.14,

	+0.12, +2.40, -0.14,
	+0.12, -0.65, +0.16,
	+0.12, -0.65, -0.16,


	+0.08, +2.40, +0.14,
	+0.08, +2.40, -0.14,
	+0.08, -0.65, +0.16,

	+0.08, -0.65, -0.16,
	+0.08, -0.65, +0.16,
	+0.08, +2.40, -0.14,


	+0.08, +2.40, -0.14,
	+0.12, +2.40, -0.14,
	+0.12, -0.65, -0.16,

	+0.08, +2.40, -0.14,
	+0.12, -0.65, -0.16,
	+0.08, -0.65, -0.16,


	+0.12, -0.65, +0.16,
	+0.12, +2.40, +0.14,
	+0.08, +2.40, +0.14,

	+0.08, -0.65, +0.16,
	+0.12, -0.65, +0.16,
	+0.08, +2.40, +0.14,


	+0.08, -0.65, -0.16,
	+0.12, -0.65, +0.16,
	+0.08, -0.65, +0.16,

	+0.12, -0.65, +0.16,
	+0.08, -0.65, -0.16,
	+0.12, -0.65, -0.16,


	+0.08, +2.40, +0.14,
	+0.12, +2.40, +0.14,
	+0.08, +2.40, -0.14,

	+0.12, +2.40, -0.14,
	+0.08, +2.40, -0.14,
	+0.12, +2.40, +0.14,

]), 3))
hand_geometry.computeVertexNormals()

var minute_hand = new THREE.Mesh(hand_geometry, hand_primary_material)
minute_hand.castShadow = true
minute_hand.receiveShadow = true

objects.add(minute_hand)
//--------------------------------------------------



// Grid
//--------------------------------------------------
var grid_material = new THREE.MeshLambertMaterial({
		color: 0x777777,
})

var grid_geometry = new THREE.Geometry()

var grid_detail = [
	[[.01, 50., .01], [-0.45, +0.00, +5.25]],
	[[.01, 50., .01], [-0.45, +0.00, -5.25]],
	[[.01, .01, 50.], [-0.45, +1.75, +0.00]],
	[[.01, .01, 50.], [-0.45, +5.25, +0.00]],
	[[.01, .01, 50.], [-0.45, -1.75, +0.00]],
	[[.01, .01, 50.], [-0.45, -5.25, +0.00]],
]

for (var i = 0; i < grid_detail.length; i++) {
	var line_geometry = new THREE.BoxGeometry(grid_detail[i][0][0], grid_detail[i][0][1], grid_detail[i][0][2])
	line_geometry.translate(grid_detail[i][1][0], grid_detail[i][1][1], grid_detail[i][1][2])
	grid_geometry.merge(line_geometry)
}

var polygon = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(grid_geometry), grid_material)
objects.add(polygon)
//--------------------------------------------------



// Orbit Controls
//--------------------------------------------------
// import {OrbitControls} from './OrbitControls.js'
// var controls = new OrbitControls(camera, renderer.domElement)
// controls.maxPolarAngle = Math.PI / 2
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
// directional_light.shadow.mapSize.width = 4096
// directional_light.shadow.mapSize.height = 4096
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
	hour_hand.rotation.x -= Math.PI * 0.001
	minute_hand.rotation.x -= Math.PI * 0.012

	// console.log(inclination)

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