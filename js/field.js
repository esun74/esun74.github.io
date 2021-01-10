import Grid from '/js/classes/Grid.js'
import Contour from '/js/classes/Contour.js'
import Retriever from '/js/classes/Retriever.js'
import Custom_Textbox from '/js/classes/Custom_Textbox.js'
import Something from '/js/classes/Experiment.js'


var files = new Retriever([
	'glsl/field.vert',
	'glsl/field.frag',
	'glsl/contour.vert',
	'glsl/contour.frag',
	'glsl/experiment.vert',
	'glsl/experiment.frag',
])

// Performance Statistics
//--------------------------------------------------
var stats = new Stats()
stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
// document.body.addEventListener('click', () => {window.location.reload()}, true)
//--------------------------------------------------

// Setting the Scene
//--------------------------------------------------
var scene = new THREE.Scene()
// scene.background = new THREE.Color(0x050505)
scene.background = new THREE.Color(0xFFFEFD)
// scene.background = new THREE.Color(0xFFEEDD)
//--------------------------------------------------

// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.001, 1000)
// camera.position.set(0, 24, 16)
camera.position.set(12, 16, 16)
camera.lookAt(0, 0, 0)
// //--------------------------------------------------

// Mouse Position
//--------------------------------------------------
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

function onMouseMove(event) {
	mouse.x = + ( event.clientX / window.innerWidth ) * 2 - 1
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
}

window.addEventListener('mousemove', onMouseMove, false)

var vertical_target = 4
function onMouseWheel(event) {
	vertical_target = Math.max(-20, Math.min(4, vertical_target - event.deltaY / 15))
}
window.addEventListener('wheel', onMouseWheel, false);
//--------------------------------------------------

// Configuring the Renderer and adding it to the DOM
//--------------------------------------------------
var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
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

// Creating a group to hold objects
//--------------------------------------------------
var objects = new THREE.Group()
scene.add(objects)
//--------------------------------------------------

// Orbit Controls
//--------------------------------------------------
import {OrbitControls} from '/js/three.js/examples/jsm/controls/OrbitControls.js'
var controls = new OrbitControls(camera, renderer.domElement)
controls.enableZoom = false
controls.enablePan = false
//--------------------------------------------------


//--------------------------------------------------

// var title1 = new Custom_Textbox(
// 	'Lorem Ipsum',
// 	[0, 8, 0],
// 	128,
// 	'georgia',
// 	'middle',
// 	'#000000',
// 	'center',)
// objects.add(title1.sprite)

// var subtitle1 = new Custom_Textbox(
// 	'Dolor Sit Amet',
// 	[0, 6.5, 0],
// 	64,
// 	'georgia',
// 	'middle',
// 	'#000000',
// 	'center',)
// objects.add(subtitle1.sprite)

// var paragraph1 = new Custom_Textbox(
// 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\
//  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\
//  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\
//  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 
//  	[0, -10, 0],
//  	32,
// 	'georgia',
// 	'middle',
// 	'#000000',
// 	'left',)
// objects.add(paragraph1.sprite)


//--------------------------------------------------

var stage = 0
var grid = null
var contour = null
var something = null
var instances = 32

// Operations each frame
//--------------------------------------------------

var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	// raycaster.setFromCamera(mouse, camera)

	if (stage == 0) {
		if ((files.retrieving[0] / files.retrieving[1]) == 1) {

			something = new Something(instances, 50, files.items)
			something.mesh.position.set(0, 0, 0)
			objects.add(something.mesh)

			// grid = new Grid(instances, 50, files.items)
			// grid.cloud.position.set(0, -2, -18)
			// objects.add(grid.cloud)

			// contour = new Contour(instances * 2, 50, files.items)
			// contour.mesh.position.set(0, -28, -18)
			// objects.add(contour.mesh)

			stage++

		}
	} else {

		// let cutoff1 = -24
		// let delta1 = (vertical_target - camera.position.y) / 10
		// camera.position.y += (vertical_target - camera.position.y) / 10

		something.update()
		// contour.update()
	}


	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()