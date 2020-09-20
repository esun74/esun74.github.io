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
scene.background = new THREE.Color(0x101010)
// scene.background = new THREE.Color(0x222222)
// scene.background = new THREE.Color(0xFFFCF2)
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.001, 1000)
camera.position.set(8, 4, 16)
camera.lookAt(0, 4, 8)
// //--------------------------------------------------

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
document.body.appendChild(renderer.domElement)
//--------------------------------------------------

// Creating a group to hold objects
//--------------------------------------------------
var objects = new THREE.Group()
scene.add(objects)
//--------------------------------------------------

// Orbit Controls
//--------------------------------------------------
import {OrbitControls} from './OrbitControls.js'
var controls = new OrbitControls(camera, renderer.domElement)
//--------------------------------------------------


var marker_material = new THREE.MeshStandardMaterial({
		color: 0x1E005E,
		emissive: 0x242424,
		roughness: 0.5,
		metalness: 1.5, 

})

var geometry = new THREE.Geometry()

for (let i = -5; i < 5; i++) {
	// for (let j = -5; j < 5; j++) {
		for (let k = -5; k < 5; k++) {
			let box_geometry = new THREE.BoxGeometry(0.5, 2.5, 0.5)
			box_geometry.translate(i * 2, 0 * 2, k * 2)
			geometry.merge(box_geometry)
		}
	// }
}

var polygon = new THREE.Mesh(geometry, marker_material)
objects.add(polygon)




//--------------------------------------------------


import {EffectComposer} from './EffectComposer.js';
import {RenderPass} from './RenderPass.js';
import {BokehPass} from './BokehPass.js';



var postprocessing = {}
var renderPass = new RenderPass(scene, camera);
var bokehPass = new BokehPass(scene, camera, {
	focus: 18.33,
	aperture: 0.0005,
	maxblur: 0.01,

	width: window.innerWidth,
	height: window.innerHeight,
});

var composer = new EffectComposer(renderer);

composer.addPass(renderPass);
composer.addPass(bokehPass);

postprocessing.composer = composer;
postprocessing.bokeh = bokehPass;

var directional_light = new THREE.DirectionalLight(0xFFFFFF, 0.75)
directional_light.castShadow = true
directional_light.shadow.mapSize.width = 2048
directional_light.shadow.mapSize.height = 2048
directional_light.shadow.camera.near = -100
directional_light.shadow.camera.far = +100
directional_light.shadow.bias = -0.0001;

directional_light.position.set(-10, -5, 10)

objects.add(directional_light)

var ambient_light = new THREE.AmbientLight(0xFFFFFF, 0.50)
objects.add(ambient_light)

// Operations each frame
//--------------------------------------------------

var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)




	// renderer.render(scene, camera)
	postprocessing.composer.render()
	stats.end()
}
//--------------------------------------------------


// render() {

// }

animate()