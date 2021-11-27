import * as THREE from 'https://cdn.skypack.dev/three@0.132.0'
// When updating past 132:
// import { FontLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/FontLoader.js'
import Stats from 'https://cdn.skypack.dev/stats.js.fps'
import Retriever from '/js/classes/Retriever.js'
import FBO from '/js/classes/FrameBufferObject.js'
import Text from '/js/classes/JSONText.js'

console.log(THREE.REVISION)

var files = new Retriever([
	'glsl/simulation.vert',
	'glsl/simulation.frag',
	'glsl/particles.vert',
	'glsl/particles.frag',
	'glsl/text.vert',
	'glsl/text.frag',
	'fonts/montserrat-medium-normal-500.json',
	'fonts/montserrat-regular-normal-400.json',
	'fonts/montserrat-light-normal-300.json',
	'fonts/montserrat-thin-normal-100.json',
	'js/text.json',
])


// Performance Statistics
//--------------------------------------------------
var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
//--------------------------------------------------

// Setting the Scene
//--------------------------------------------------
var scene = new THREE.Scene()
// scene.background = new THREE.Color(0x050505)
// scene.background = new THREE.Color(0xFFFEFD)
// scene.background = new THREE.Color(0x1E1E1E)
scene.background = new THREE.Color(0x141824)
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
	0, 100,
	)
camera.position.set(0, 0, 5)
camera.lookAt(0, 0, 0)
camera.zoom = window.innerWidth / 10
camera.updateProjectionMatrix()
// //--------------------------------------------------

// Mouse Position
//--------------------------------------------------
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()
var vertical_target = 0
var vertical_target_max = 0
var vertical_target_min = -12.8
var currently_clicking = false
var x_position = 0
var x_target = 0
var x_begin = 0
var y_position = 0
var y_target = 0
var y_begin = 0



// window.addEventListener('touchstart', e => {
// 	e.preventDefault()
// 	if (!e.changedTouches[0].identifier) {
// 		console.log('Touch Start')
// 		mouse.x = +(e.touches[0].screenX / e.touches[0].clientX) * 2 - 1
// 		mouse.y = -(e.touches[0].screenY / e.touches[0].clientY) * 2 + 1
// 	} else {
// 		console.log('DUPE TOUCH START')
// 	}
// }, {passive: false})

// window.addEventListener('touchmove', e => {
// 	var new_x = +(e.touches[0].screenX / e.touches[0].clientX) * 2 - 1
// 	var new_y = -(e.touches[0].screenY / e.touches[0].clientY) * 2 + 1

// 	vertical_target = Math.max(
// 		vertical_target_min, 
// 		Math.min(
// 			vertical_target_max, 
// 			vertical_target - (mouse.y - new_y) * 2
// 		)
// 	)

// 	objects.rotation.y = +Math.max(vertical_target, -1.57)
// 	objects.rotation.z = -Math.max(vertical_target, -1.57) * 2

// 	mouse.x = new_x
// 	mouse.y = new_y
// }, {passive: false})
// window.addEventListener('touchforcechange', e => {e.preventDefault()}, {passive: false})

// window.addEventListener('touchend', e => {
// 	if (!e.changedTouches[0].identifier) {
// 		console.log('Touch End')
// 	} else {
// 		console.log('DUPE TOUCH END')
// 	}
// }, {passive: false})

window.addEventListener('wheel', e => {
	vertical_target = Math.max(vertical_target_min, Math.min(vertical_target_max, vertical_target - event.deltaY / 125))
}, {passive: false});

//--------------------------------------------------

// Configuring the Renderer and adding it to the DOM
//--------------------------------------------------
var renderer = new THREE.WebGLRenderer({alpha: true, antialias: false})
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
	camera.zoom = window.innerWidth / 10
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
}, {passive: false})
//--------------------------------------------------

// Creating a group to hold objects
//--------------------------------------------------
var objects = new THREE.Group()
scene.add(objects)
//--------------------------------------------------

// Fonts
//--------------------------------------------------
var font_loader = new THREE.FontLoader();

//--------------------------------------------------


var stage = 0
var instances = 8
var line_01 = null
var line_02 = null
var cloud = null
var text_meshes = null
var vec = new THREE.Vector3()
var pos = new THREE.Vector3()

// Operations each frame
//--------------------------------------------------

var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	// raycaster.setFromCamera(mouse, camera)

	if (stage == 0) {

		if (files.retrieving[0] == files.retrieving[1]) {

			console.log('Files Retrieved')

			files.items['fonts/montserrat-medium-normal-500.json'] = font_loader.parse(files.items['fonts/montserrat-medium-normal-500.json'])
			files.items['fonts/montserrat-regular-normal-400.json'] = font_loader.parse(files.items['fonts/montserrat-regular-normal-400.json'])
			files.items['fonts/montserrat-light-normal-300.json'] = font_loader.parse(files.items['fonts/montserrat-light-normal-300.json'])
			files.items['fonts/montserrat-thin-normal-100.json'] = font_loader.parse(files.items['fonts/montserrat-thin-normal-100.json'])

			text_meshes = new Text(files)
			objects.add(text_meshes.meshes)

			cloud = new FBO(Math.pow(2, 8), renderer, files)
			objects.add(cloud.particles)
			cloud.update(camera.position.y)

			console.log('Stage 1 -> Stage 2')
			stage++

		}

	} else if (stage == 1) {

		// font_material.opacity = (3 * objects.rotation.y + Math.PI) / -2

		// objects.rotation.y += (-1.57 - objects.rotation.y) / 10
		// objects.rotation.z -= (objects.rotation.z + -1.57 * 2) / 10

		// cloud.update(camera.position.y)

		// if (objects.rotation.y < -1.56999) {
		// 	objects.rotation.y = -1.57
		// 	vertical_target = 0


			window.addEventListener('mousemove', e => {

				x_position = +(e.clientX / window.innerWidth) * 2 - 1
				y_position = -(e.clientY / window.innerHeight) * 2 + 1

				x_target = +x_position / 32
				y_target = +y_position / 128

				if (currently_clicking) {
					x_target += -(x_position - x_begin) / 2
					y_target += -(y_position - y_begin) / 8
				}

			}, {passive: false})

			window.addEventListener('mousedown', e => {
				currently_clicking = true
				x_begin = +(e.clientX / window.innerWidth) * 2 - 1
				y_begin = -(e.clientY / window.innerHeight) * 2 + 1
			}, {passive: false})

			window.addEventListener('mouseup', e => {
				currently_clicking = false
			}, {passive: false})

			console.log('Stage 2 -> Stage 3')
			stage++
		// }
		
	} else if (stage == 2) {

		camera.position.y += (vertical_target - camera.position.y) / 5
		objects.rotation.y += (x_target - objects.rotation.y) / 5
		camera.rotation.x += (y_target - camera.rotation.x) / 5

		vec.set(x_position, y_position, 0.5)
		vec.unproject(camera)
		vec.sub(camera.position).normalize()
		pos.copy(camera.position).add(vec.multiplyScalar((0 - camera.position.z) / vec.z))

		cloud.update(camera.position.y, pos)
	}

	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()
