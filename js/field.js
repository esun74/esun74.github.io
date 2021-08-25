import Retriever from '/js/classes/Retriever.js'
import Swirls from '/js/classes/Afterimage.js'

var files = new Retriever([
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
	)
camera.position.set(0, 0, 5)
camera.lookAt(0, 0, 0)
camera.updateProjectionMatrix()
// //--------------------------------------------------

// Mouse Position
//--------------------------------------------------
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()
var vertical_target = 0
var vertical_target_max = 0
var vertical_target_min = -8.6
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
				vertical_target - (new_y - mouse.y)
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
	opacity: 1.0,
	side: THREE.DoubleSide
})
//--------------------------------------------------


var stage = 0
var instances = 8
var line_01 = null
var line_02 = null
var bottom_text = null

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
		if ((files.retrieving[0] / files.retrieving[1]) == 1) {

			line_01 = new Swirls(instances, 10, files.items)
			line_01.mesh.position.set(0, 0, 0)
			objects.add(line_01.mesh)

			line_02 = new Swirls(instances, 10, files.items)
			line_02.mesh.position.set(0, 0, 0)
			objects.add(line_02.mesh)


			font_loader.load('fonts/montserrat-light-normal-300.json', font => {

				var message = "Scroll Down"
				var text_geometry = new THREE.ShapeGeometry(font.generateShapes(message, 0.1))

				text_geometry.computeBoundingBox()
				text_geometry.translate(
					(text_geometry.boundingBox.min.x - text_geometry.boundingBox.max.x) / 2 + 3.6, 
					(text_geometry.boundingBox.max.y - text_geometry.boundingBox.min.y) / 2 - 2.4, 
					0.99
				)
				// text_geometry.rotateX(Math.PI)
				// text_geometry.rotateY(Math.PI / 2)

				objects.add(new THREE.Mesh(
					text_geometry, 
					new THREE.MeshBasicMaterial({
					color: 0xFFFEFD,
					transparent: true,
					opacity: 0.6,
					side: THREE.DoubleSide
				})))

			})


			font_loader.load('fonts/montserrat-medium-normal-500.json', font => {

				var message = "Ipsum Lorem"
				var text_geometry = new THREE.ShapeGeometry(font.generateShapes(message, 0.2))

				text_geometry.computeBoundingBox()
				text_geometry.translate(
					(text_geometry.boundingBox.min.x - text_geometry.boundingBox.max.x) / 2 - 2.6, 
					(text_geometry.boundingBox.max.y - text_geometry.boundingBox.min.y) / 2 + 1.4, 
					+0.75
				)
				text_geometry.rotateX(Math.PI)
				text_geometry.rotateY(Math.PI / 2)

				objects.add(new THREE.Mesh(text_geometry, font_material))

			})

			font_loader.load('fonts/montserrat-light-normal-300.json', font => {

				var message = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem \naccusantium doloremque laudantium, totam rem aperiam, eaque \nipsa quae ab illo inventore veritatis et quasi architecto beatae vitae \ndicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas \nsit aspernatur aut odit aut fugit, sed quia consequuntur magni \ndolores eos qui ratione voluptatem sequi nesciunt."
				var text_geometry = new THREE.ShapeGeometry(font.generateShapes(message, 0.1))

				text_geometry.computeBoundingBox()
				text_geometry.translate(
					(text_geometry.boundingBox.min.x - text_geometry.boundingBox.max.x) / 2 + 2.2, 
					(text_geometry.boundingBox.max.y - text_geometry.boundingBox.min.y) / 2 - 1.6, 
					-0.75
				)
				text_geometry.rotateX(Math.PI)
				text_geometry.rotateY(Math.PI / 2)

				objects.add(new THREE.Mesh(text_geometry, font_material))

			})


			font_loader.load('fonts/montserrat-light-normal-300.json', font => {

				var message = "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis \nsuscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis \nautem vel eum iure reprehenderit qui in ea voluptate velit esse quam \nnihil molestiae consequatur, vel illum qui dolorem eum fugiat quo \nvoluptas nulla pariatur?"
				var text_geometry = new THREE.ShapeGeometry(font.generateShapes(message, 0.1))

				text_geometry.computeBoundingBox()
				text_geometry.translate(
					(text_geometry.boundingBox.min.x - text_geometry.boundingBox.max.x) / 2 + 0, 
					(text_geometry.boundingBox.max.y - text_geometry.boundingBox.min.y) / 2 - 6.4, 
					-0.75
				)
				text_geometry.rotateX(Math.PI)
				text_geometry.rotateY(Math.PI / 2)
				// text_geometry.rotateX(Math.PI * 0.1)

				objects.add(new THREE.Mesh(text_geometry, font_material))

			})

			font_loader.load('fonts/montserrat-light-normal-300.json', font => {

				var message = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium \nvoluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint \noccaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia \nanimi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita \ndistinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit \nquo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, \nomnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum \nnecessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non \nrecusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis \nvoluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
				var text_geometry = new THREE.ShapeGeometry(font.generateShapes(message, 0.1))

				text_geometry.computeBoundingBox()
				text_geometry.translate(
					(text_geometry.boundingBox.min.x - text_geometry.boundingBox.max.x) / 2 + 0, 
					(text_geometry.boundingBox.max.y - text_geometry.boundingBox.min.y) / 2 - 12.8, 
					-0.75
				)
				text_geometry.rotateX(Math.PI)
				text_geometry.rotateY(Math.PI / 2)
				// text_geometry.rotateX(Math.PI * 0.1)

				objects.add(new THREE.Mesh(text_geometry, font_material))

			})

			stage++

		}

	} else if (stage == 1) {

		if (camera.zoom < window.innerWidth / 10) {

			camera.zoom += (window.innerWidth / 10 + 50 - camera.zoom) / 20
			camera.updateProjectionMatrix()

			line_01.update()
			line_02.update()
			
		} else {

			vertical_target = 0
			stage++

		}
		

	} else if (stage == 2) {

		objects.rotation.y += +(Math.max(vertical_target, -1.57) - objects.rotation.y) / 10
		objects.rotation.z += -(Math.max(vertical_target, -1.57) * 2 + objects.rotation.z) / 10

		if (objects.rotation.y < -1.565) {
			objects.rotation.y = -1.57
			vertical_target = -1.57
			stage++
		}

		line_01.update()
		line_02.update()

		font_material.opacity = -(objects.rotation.y + (Math.PI / 4))

	} else if (stage == 3) {

		camera.position.y += +(Math.min(vertical_target + 1.57) * 2 - camera.position.y) / 5

		if (camera.position.y > 0) {
			camera.position.y = 0
			stage--
		}

		if (camera.position.y > -4) {
			line_01.update()
			line_02.update()
		}
	}


	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()