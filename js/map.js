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
var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 25, 25), concrete_material)
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
	ring_geometry.merge(new THREE.RingGeometry(4.5, 5.0, 8, 1, (Math.PI / 4) * i, (Math.PI / 4) - 0.05))
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
loop_geometry.merge(new THREE.TorusGeometry(3.0, 0.015, 6, 64, Math.PI * 1.95))
loop_geometry.rotateZ(Math.PI / 2 + 0.06)

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
polygon.rotation.set(0, Math.PI / 2, 0)
polygon.castShadow = true
polygon.receiveShadow = true
objects.add(polygon)
//--------------------------------------------------




var material = new THREE.MeshLambertMaterial({
		color: 0xCCCCCC,
})

// Center Box
//--------------------------------------------------
var polygon = new THREE.Mesh(new THREE.BoxBufferGeometry(Math.random() * 0.5 + 0.2, Math.random() + 1.0, Math.random() * 0.5 + 0.2), material)
polygon.position.set(0, -2.5, 0)
polygon.castShadow = true
polygon.receiveShadow = true
objects.add(polygon)
//--------------------------------------------------



// Hexagons
//--------------------------------------------------
var count = 3
var geometries = new THREE.BufferGeometry()
var geo_positions = new Float32Array(count * 162)

for (var i = 0; i < count; i++) {
	var x = (i * 2.5) - 2.5
	var y = -3.0
	var z = 2.5
	var radius = Math.random() * 0.15 + 0.25
	var height = Math.random() + 1.0

	for (var side = 0; side < 6; side++) {
		var angle_1 = Math.PI * (side + 0) / 3
		var angle_2 = Math.PI * (side + 1) / 3

		geo_positions[(162 * i) + (27 * side) + 0] = x + (radius * Math.cos(angle_1))
		geo_positions[(162 * i) + (27 * side) + 1] = y + height
		geo_positions[(162 * i) + (27 * side) + 2] = z + (radius * Math.sin(angle_1))

		geo_positions[(162 * i) + (27 * side) + 3] = x + (radius * Math.cos(angle_2))
		geo_positions[(162 * i) + (27 * side) + 4] = y + height
		geo_positions[(162 * i) + (27 * side) + 5] = z + (radius * Math.sin(angle_2))

		geo_positions[(162 * i) + (27 * side) + 6] = x + (radius * Math.cos(angle_2))
		geo_positions[(162 * i) + (27 * side) + 7] = y
		geo_positions[(162 * i) + (27 * side) + 8] = z + (radius * Math.sin(angle_2))


		geo_positions[(162 * i) + (27 * side) + 9] = x + (radius * Math.cos(angle_1))
		geo_positions[(162 * i) + (27 * side) + 10] = y + height
		geo_positions[(162 * i) + (27 * side) + 11] = z + (radius * Math.sin(angle_1))

		geo_positions[(162 * i) + (27 * side) + 12] = x + (radius * Math.cos(angle_2))
		geo_positions[(162 * i) + (27 * side) + 13] = y
		geo_positions[(162 * i) + (27 * side) + 14] = z + (radius * Math.sin(angle_2))

		geo_positions[(162 * i) + (27 * side) + 15] = x + (radius * Math.cos(angle_1))
		geo_positions[(162 * i) + (27 * side) + 16] = y
		geo_positions[(162 * i) + (27 * side) + 17] = z + (radius * Math.sin(angle_1))


		geo_positions[(162 * i) + (27 * side) + 18] = x + (radius * Math.cos(angle_1))
		geo_positions[(162 * i) + (27 * side) + 19] = y + height
		geo_positions[(162 * i) + (27 * side) + 20] = z + (radius * Math.sin(angle_1))

		geo_positions[(162 * i) + (27 * side) + 21] = x
		geo_positions[(162 * i) + (27 * side) + 22] = y + height
		geo_positions[(162 * i) + (27 * side) + 23] = z

		geo_positions[(162 * i) + (27 * side) + 24] = x + (radius * Math.cos(angle_2))
		geo_positions[(162 * i) + (27 * side) + 25] = y + height
		geo_positions[(162 * i) + (27 * side) + 26] = z + (radius * Math.sin(angle_2))
	}
}
geometries.addAttribute('position', new THREE.BufferAttribute(geo_positions, 3))
geometries.computeVertexNormals()

var hexagons = new THREE.Mesh(geometries, material)
hexagons.castShadow = true
hexagons.receiveShadow = true

objects.add(hexagons)
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
directional_light.shadow.camera.near = sun_distance - 100
directional_light.shadow.camera.far = sun_distance + 100
directional_light.shadow.bias = - 0.00001;

objects.add(directional_light)

var ambient_light = new THREE.AmbientLight(0xFFFFFF, 0.00)
objects.add(ambient_light)
//--------------------------------------------------



// Set Sun Position
//--------------------------------------------------
var theta = -Math.PI * ((inclination))
var phi = 2 * Math.PI * azimuth;

directional_light.position.x = sun_distance * Math.cos(phi);
directional_light.position.y = sun_distance * Math.sin(phi) * Math.sin(theta);
directional_light.position.z = sun_distance * Math.sin(phi) * Math.cos(theta);

directional_light.intensity = Math.min(directional_light.position.y / 100000, 1.0)
ambient_light.intensity = directional_light.intensity / 3
sky.material.uniforms["sunPosition"].value.copy(directional_light.position)
//--------------------------------------------------



// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	raycaster.setFromCamera(mouse, camera)



	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()