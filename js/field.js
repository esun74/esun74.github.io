import * as THREE from 'https://cdn.skypack.dev/three'
import Retriever from '/js/classes/Retriever.js'
import Swirls from '/js/classes/Afterimage.js'
import FBO from '/js/classes/FrameBufferObject.js'

console.log(THREE.REVISION)

var files = new Retriever([
	'glsl/afterimage.vert',
	'glsl/afterimage.frag',
	'glsl/simulation.vert',
	'glsl/simulation.frag',
	'glsl/particles.vert',
	'glsl/particles.frag',
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
// document.body.addEventListener('click', () => {window.location.reload()}, true)
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
	4, 6

	// -100, 100
	)
camera.position.set(0, 0, 10)
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
var vertical_target_min = -7.97
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
				vertical_target - (new_y - mouse.y) * 1.2
			)
		)

		objects.rotation.y = +Math.max(vertical_target, -1.57)
		objects.rotation.z = -Math.max(vertical_target, -1.57) * 2
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

	objects.rotation.y = +Math.max(vertical_target, -1.57)
	objects.rotation.z = -Math.max(vertical_target, -1.57) * 2

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

// Orbit Controls
//--------------------------------------------------
// import {OrbitControls} from '/js/three.js/examples/jsm/controls/OrbitControls.js'
// var controls = new OrbitControls(camera, renderer.domElement)
//--------------------------------------------------

// Fonts
//--------------------------------------------------
var font_loader = new THREE.FontLoader();
var font_material = new THREE.MeshBasicMaterial({
	color: 0xFFFEFD,
	transparent: true,
	opacity: 0.01,
	side: THREE.DoubleSide,
	depthTest: false,
	depthWrite: false,
})
var font_material2 = new THREE.MeshBasicMaterial({
	color: 0xFFFEFD,
	transparent: true,
	opacity: 0.01,
	side: THREE.DoubleSide
})

//--------------------------------------------------


var stage = 0
var instances = 8
var line_01 = null
var line_02 = null
var cloud = null

var misc_line_geometry = new THREE.BufferGeometry()

misc_line_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
	0, 3.2, -3.2,
	0, 3.2, +3.2,
	0, 9.6, -3.2,
	0, 9.6, +3.2,
	0, 16., -3.2,
	0, 16., +3.2,
]), 3))

objects.add(new THREE.LineSegments(misc_line_geometry, font_material))

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

			line_01 = new Swirls(instances, 10, files.items)
			line_01.mesh.position.set(0, 0, 0)
			objects.add(line_01.mesh)

			line_02 = new Swirls(instances, 10, files.items)
			line_02.mesh.position.set(0, 0, 0)
			objects.add(line_02.mesh)


			for (let i in files.items['js/text.json'].content) {

				i = files.items['js/text.json'].content[i]

				let text_shape = new THREE.ShapeGeometry(files.items[i.font].generateShapes(i.text, i.size))
				text_shape.computeBoundingBox()
				text_shape.translate(
					(text_shape.boundingBox.min.x - text_shape.boundingBox.max.x) / 2 + i.x_offset, 
					(text_shape.boundingBox.max.y - text_shape.boundingBox.min.y) / 2 + i.y_offset, 
					i.z_offset
				)
				text_shape.rotateX(Math.PI * i.x_rotate)
				text_shape.rotateY(Math.PI * i.y_rotate)

				objects.add(new THREE.Mesh(text_shape, font_material))

			}



			// for (let i = 0; i < 25; i++) {

			// 	let test_text = Math.random().toString(36).substr(2, 14)
			// 	let text_shape = new THREE.ShapeGeometry(files.items['fonts/montserrat-thin-normal-100.json'].generateShapes(test_text, 0.1))
			// 	text_shape.computeBoundingBox()
			// 	text_shape.translate(
			// 		(text_shape.boundingBox.min.x - text_shape.boundingBox.max.x) / 2 + (Math.random() - 0.5) * 9.0, 
			// 		(text_shape.boundingBox.max.y - text_shape.boundingBox.min.y) / 2 + (Math.random() - 1.8) * 5.0, 
			// 		(Math.random() - 0.5)
			// 	)
			// 	text_shape.rotateX(Math.PI * 1.0)
			// 	text_shape.rotateY(Math.PI * 0.5)

			// 	objects.add(new THREE.Mesh(text_shape, font_material))

			// }

			cloud = new FBO(
				Math.pow(2, 8),
				renderer, 
				files,
			)
			cloud.particles.position.set(0, 6.4, 0)
			cloud.particles.visible = false
			cloud.particles.frustumCulled = false
			objects.add(cloud.particles)


			console.log('Stage 1 -> Stage 2')
			stage++

		}

	} else if (stage == 1) {
		if (camera.position.z > 5) {

			camera.position.z += (4.95 - camera.position.z) / 20

			line_01.update()
			line_02.update()
			
		} else {

			console.log('Creating Text: \nScroll Down')

			var text_geometry = new THREE.ShapeGeometry(files.items['fonts/montserrat-light-normal-300.json'].generateShapes("Scroll Down", 0.1))

			text_geometry.computeBoundingBox()
			text_geometry.translate(
				(text_geometry.boundingBox.min.x - text_geometry.boundingBox.max.x) / 2 + 3.6, 
				(text_geometry.boundingBox.max.y - text_geometry.boundingBox.min.y) / 2 - 2.4, 
				0
			)

			objects.add(new THREE.Mesh(
				text_geometry, 
				font_material2))

			camera.position.z = 5
			vertical_target = 0

			console.log('Stage 2 -> Stage 3')
			stage++

		}
		
	} else if (stage == 2) {

		font_material.opacity = (3 * objects.rotation.y + Math.PI) / -2
		font_material2.opacity += (Math.min(vertical_target * 5 + 1, 0.5) - font_material2.opacity) / 10

		objects.rotation.y += (Math.max(vertical_target, -1.57) - objects.rotation.y) / 10
		objects.rotation.z -= (objects.rotation.z + Math.max(vertical_target, -1.57) * 2) / 10

		if (objects.rotation.y < -1.565) {
			objects.rotation.y = -1.57
			vertical_target = -1.57
			cloud.particles.visible = true

			console.log('Stage 3 -> Stage 4')
			stage++
		}

		line_01.update()
		line_02.update()

	} else if (stage == 3) {

		camera.position.y += +((vertical_target + 1.57) * 2 - camera.position.y) / 5

		camera.far = 6 - camera.position.y
		camera.near = 4 + camera.position.y
		camera.updateProjectionMatrix()

		if (camera.position.y > 0) {
			camera.position.y = 0
			camera.far = 6
			camera.near = 4
			camera.updateProjectionMatrix()
			cloud.particles.visible = false

			console.log('Stage 4 -> Stage 3')
			stage--
		}

		if (camera.position.y > -3.6) {
			line_01.update()
			line_02.update()
		} else {
			cloud.update()
		}
		
	}


	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()
