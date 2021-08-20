import Contour from '/js/classes/Contour.js'
import Retriever from '/js/classes/Retriever.js'
import Custom_Textbox from '/js/classes/Custom_Textbox.js'
import Something from '/js/classes/Experiment.js'
import Swirls from '/js/classes/Afterimage.js'


var files = new Retriever([
	'glsl/field.vert',
	'glsl/field.frag',
	'glsl/contour.vert',
	'glsl/contour.frag',
	'glsl/experiment.vert',
	'glsl/experiment.frag',
	'glsl/afterimage.vert',
	'glsl/afterimage.frag',
])

// Performance Statistics
//--------------------------------------------------
var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
// document.body.addEventListener('click', () => {window.location.reload()}, true)
//--------------------------------------------------

// Setting the Scene
//--------------------------------------------------
var scene = new THREE.Scene()
// scene.background = new THREE.Color(0x050505)
// scene.background = new THREE.Color(0xFFFEFD)
scene.background = new THREE.Color(0x1E1E1E)
// scene.background = new THREE.Color(0xFFEEDD)
//--------------------------------------------------

// Setting the Camera
//--------------------------------------------------
// var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.001, 1000)
var camera = new THREE.OrthographicCamera(
	window.innerWidth / - 2, 
	window.innerWidth / 2, 
	window.innerHeight / 2, 
	window.innerHeight / - 2, 
	4, 6
	)
camera.position.set(0, 0, -5)
camera.lookAt(0, 0, 0)
camera.rotation.z = -0.3
camera.updateProjectionMatrix()
// //--------------------------------------------------

// Mouse Position
//--------------------------------------------------
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()
var vertical_target = 0
var vertical_target_max = 0
var vertical_target_min = -1.57
var currently_clicking = false

window.addEventListener('mousedown', e => {
	currently_clicking = true
}, {passive: false})

window.addEventListener('mousemove', e => {

	var new_x = +(e.clientX / window.innerWidth) * 2 - 1
	var new_y = -(e.clientY / window.innerHeight) * 2 + 1

	if (currently_clicking) {
		vertical_target = Math.max(
			vertical_target_min, 
			Math.min(
				vertical_target_max, 
				vertical_target - (new_y - mouse.y) * 2
			)
		)

		objects.rotation.y = vertical_target
		objects.rotation.z = -vertical_target * 2
	}

	mouse.x = new_x
	mouse.y = new_y
}, {passive: false})

window.addEventListener('mouseup', e => {
	currently_clicking = false
}, {passive: false})

window.addEventListener('touchstart', e => {
	e.preventDefault()
	if (!e.changedTouches[0].identifier) {
		console.log('Touch Start')
		mouse.x = +(e.touches[0].screenX / e.touches[0].clientX) * 2 - 1
		mouse.y = -(e.touches[0].screenY / e.touches[0].clientY) * 2 + 1
	} else {
		console.log('DUPE TOUCH START')
	}
}, {passive: false})

window.addEventListener('touchmove', e => {

	var new_x = +(e.touches[0].screenX / e.touches[0].clientX) * 2 - 1
	var new_y = -(e.touches[0].screenY / e.touches[0].clientY) * 2 + 1

	vertical_target = Math.max(
		vertical_target_min, 
		Math.min(
			vertical_target_max, 
			vertical_target - (mouse.y - new_y) * 2
		)
	)

	objects.rotation.y = vertical_target
	objects.rotation.z = -vertical_target * 2

	mouse.x = new_x
	mouse.y = new_y
}, {passive: false})
window.addEventListener('touchforcechange', e => {e.preventDefault()}, {passive: false})

window.addEventListener('touchend', e => {
	if (!e.changedTouches[0].identifier) {
		console.log('Touch End')
	} else {
		console.log('DUPE TOUCH END')
	}
}, {passive: false})

window.addEventListener('wheel', e => {
	vertical_target = Math.max(vertical_target_min, Math.min(vertical_target_max, vertical_target - event.deltaY / 250))
}, {passive: false});
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
window.addEventListener('resize', e => {
	camera.left = window.innerWidth / - 2
	camera.right = window.innerWidth / 2
	camera.top = window.innerHeight / 2
	camera.bottom = window.innerHeight / - 2
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
}, {passive: false})
//--------------------------------------------------

// Creating a group to hold objects
//--------------------------------------------------
var objects = new THREE.Group()
scene.add(objects)
//--------------------------------------------------

// Orbit Controls
//--------------------------------------------------
// import {OrbitControls} from '/js/three.js/examples/jsm/controls/OrbitControls.js'
// var controls = new OrbitControls(camera, renderer.domElement)
// controls.enableZoom = false
// controls.enablePan = false
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
var instances = 8
var line_01 = null
var line_02 = null
var line_03 = null

// Operations each frame
//--------------------------------------------------

var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	// raycaster.setFromCamera(mouse, camera)

	if (stage == 0) {
		if ((files.retrieving[0] / files.retrieving[1]) == 1) {

			line_01 = new Swirls(instances, 10, files.items)
			line_01.mesh.position.set(0, 0, 0)
			objects.add(line_01.mesh)

			line_02 = new Swirls(instances, 10, files.items)
			line_02.mesh.position.set(0, 0, 0)
			objects.add(line_02.mesh)

			// line_03 = new Something(instances, 20, files.items)
			// line_03.mesh.position.set(-10, 0, 0)
			// objects.add(line_03.mesh)

			stage++

		}
	} else {

		if (camera.zoom != 200) {
			camera.zoom += (200 - camera.zoom) / 5
			camera.updateProjectionMatrix()
		}
		

		objects.rotation.y += +(Math.max(vertical_target, vertical_target_min) - objects.rotation.y) / 10
		objects.rotation.z += -(Math.max(vertical_target, vertical_target_min) * 2 + objects.rotation.z) / 10

		line_01.update()
		line_02.update()
		// line_03.update()

		// contour.update()
	}


	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()