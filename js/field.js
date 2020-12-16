var retrieving = [0, 0]

function retrieve(target, path) {
	let req = new XMLHttpRequest()

	req.onreadystatechange = function() {
		if (req.readyState === 4) {
			console.log('Received ' + path)
			target[path] = req.response
			retrieving[0]++
		}
	};

	console.log('Requested ' + path)
	req.open('GET', path, true)
	req.send()
	retrieving[1]++
}

var items = {}
var item_list = [
	'js/glsl/field.vert',
	'js/glsl/field.frag',
	'js/glsl/contour.vert',
	'js/glsl/contour.frag',
]
item_list.forEach(e => retrieve(items, e))


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
camera.position.set(0, 24, 16)
// camera.lookAt(0, 4, 0)
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
// import {OrbitControls} from '/js/three.js/examples/jsm/controls/OrbitControls.js'
// var controls = new OrbitControls(camera, renderer.domElement)
//--------------------------------------------------


var instances = 100

// const cnoise4D = gpu.createKernel(function(time, instances, positions, normalized) {

// 	let offset_x = 100
// 	let offset_y = 200
// 	let offset_z = 300
// 	let finite_difference_amount = 0.01
// 	let scale = 0.1

// 	let x_position = positions[((this.thread.x * instances + this.thread.y) * instances + this.thread.z) * 3 + 0] / 10
// 	let y_position = positions[((this.thread.x * instances + this.thread.y) * instances + this.thread.z) * 3 + 1] / 10
// 	let z_position = positions[((this.thread.x * instances + this.thread.y) * instances + this.thread.z) * 3 + 2] / 10

// 	let d_x0_y = snoise([x_position - finite_difference_amount, y_position, z_position, time + offset_y])
// 	let d_x0_z = snoise([x_position - finite_difference_amount, y_position, z_position, time + offset_z])
// 	let d_x1_y = snoise([x_position + finite_difference_amount, y_position, z_position, time + offset_y])
// 	let d_x1_z = snoise([x_position + finite_difference_amount, y_position, z_position, time + offset_z])
	
// 	let d_y0_x = snoise([x_position, y_position - finite_difference_amount, z_position, time + offset_x])
// 	let d_y0_z = snoise([x_position, y_position - finite_difference_amount, z_position, time + offset_z])
// 	let d_y1_x = snoise([x_position, y_position + finite_difference_amount, z_position, time + offset_x])
// 	let d_y1_z = snoise([x_position, y_position + finite_difference_amount, z_position, time + offset_z])

// 	let d_z0_x = snoise([x_position, y_position, z_position - finite_difference_amount, time + offset_x])
// 	let d_z0_y = snoise([x_position, y_position, z_position - finite_difference_amount, time + offset_y])
// 	let d_z1_x = snoise([x_position, y_position, z_position + finite_difference_amount, time + offset_x])
// 	let d_z1_y = snoise([x_position, y_position, z_position + finite_difference_amount, time + offset_y])

// 	let curl_x = (d_y1_z - d_y0_z - d_z1_y + d_z0_y) / (2.0 * finite_difference_amount)
// 	let curl_y = (d_z1_x - d_z0_x - d_x1_z + d_x0_z) / (2.0 * finite_difference_amount)
// 	let curl_z = (d_x1_y - d_x0_y - d_y1_x + d_y0_x) / (2.0 * finite_difference_amount)

// 	let curl_magnitude = Math.sqrt((curl_x * curl_x) + (curl_y * curl_y) + (curl_z * curl_z))

// 	curl_x /= curl_magnitude
// 	curl_y /= curl_magnitude
// 	curl_z /= curl_magnitude

// 	if (normalized) {
// 		curl_x = Math.round(curl_x)
// 		curl_y = Math.round(curl_y)
// 		curl_z = Math.round(curl_z)
// 	}

// 	return [curl_x * scale, curl_y * scale, curl_z * scale]
// }).setOutput([instances, instances, instances])

// const noise3D = gpu.createKernel(function(time, instances, positions) {
// 	// let offset_x = 100
// 	// let offset_y = 200
// 	let scale = 0.05

// 	let x_position = positions[(this.thread.x * instances + this.thread.y) * 3 + 0]
// 	let y_position = positions[(this.thread.x * instances + this.thread.y) * 3 + 2]

// 	return snoise([x_position * scale, y_position * scale, time * scale])

// }).setOutput([instances, instances])


// const cnoise3D = gpu.createKernel(function(time, instances, positions) {
// 	let scale = 0.05

// 	let x_position = positions[(this.thread.x * instances + this.thread.y) * 3 + 0]
// 	let y_position = positions[(this.thread.x * instances + this.thread.y) * 3 + 2]

// 	return snoise([x_position * scale, y_position * scale, time * scale])

// }).setOutput([instances, instances])

//--------------------------------------------------



class Grid {
	constructor(count, space) {
		this.count = count
		this.space = space
		this.positions = new Float32Array(this.count * this.count * 3)
		this.colors = new Float32Array(this.count * this.count * 3)

		for (let i = 0; i < this.count; i++) {
			for (let j = 0; j < this.count; j++) {
				this.positions[(i * this.count + j) * 3 + 0] = ((i + 0.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 3 + 1] = 0
				this.positions[(i * this.count + j) * 3 + 2] = ((j + 0.5) / this.count - 0.5) * space
			}
		}

		for (let i = 0; i < this.count; i++) {
			for (let j = 0; j < this.count; j++) {

				// if ((i + j) % 2 == 0) {
					this.colors[(i * this.count + j) * 3 + 0] = 0.250
					this.colors[(i * this.count + j) * 3 + 1] = 1.000
					this.colors[(i * this.count + j) * 3 + 2] = 0.750
				// } else if (j % 2 == 0) {
					// this.colors[(i * this.count + j) * 3 + 0] = 1.000
					// this.colors[(i * this.count + j) * 3 + 1] = 0.375
					// this.colors[(i * this.count + j) * 3 + 2] = 0.250
				// } else {
					// this.colors[(i * this.count + j) * 3 + 0] = 0.250
					// this.colors[(i * this.count + j) * 3 + 1] = 0.500
					// this.colors[(i * this.count + j) * 3 + 2] = 1.000
				// }
			}
		}


		this.material = new THREE.ShaderMaterial({
			uniforms: {
				focus: {value: 17.5},
				time: {value: Math.random() * 100},
				scale: {value: 0.05},
				height: {value: 5.0},
				location: {value: 8.0},
			},

			vertexShader: items['js/glsl/field.vert'],
			fragmentShader: items['js/glsl/field.frag'],

			transparent: true,
			depthWrite: false,
		})

		this.particles = new THREE.BufferGeometry()
		this.particles.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(35048))
		this.particles.setAttribute('color', new THREE.BufferAttribute(this.colors, 3).setUsage(35048))
		this.cloud = new THREE.Points(this.particles, this.material)

	}

	update() {
		this.material.uniforms.time.value += 0.025
		// this.cloud.geometry.attributes.position.needsUpdate = true
		// this.cloud.geometry.attributes.color.needsUpdate = true
	}
}


class Contour {
	constructor(count, space) {
		this.count = count
		this.space = space
		this.positions = new Float32Array(this.count * this.count * 18)
		this.colors = new Float32Array(this.count * this.count * 18)

		for (let i = 0; i < this.count; i++) {
			for (let j = 0; j < this.count; j++) {
				this.positions[(i * this.count + j) * 18 + 0] = ((i + 0.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 2] = ((j + 0.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 3] = ((i + 1.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 5] = ((j + 1.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 6] = ((i + 1.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 8] = ((j + 0.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 9] = ((i + 0.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 11] = ((j + 0.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 12] = ((i + 0.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 14] = ((j + 1.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 15] = ((i + 1.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 18 + 17] = ((j + 1.5) / this.count - 0.5) * space
			}
		}

		for (let i = 0; i < this.count; i++) {
			for (let j = 0; j < this.count; j++) {
				for (let k = 0; k < 6; k++) {
					this.colors[(i * this.count + j) * 18 + (k * 3) + 0] = 0.250
					this.colors[(i * this.count + j) * 18 + (k * 3) + 1] = 1.000
					this.colors[(i * this.count + j) * 18 + (k * 3) + 2] = 0.750
				}
			}
		}


		this.material = new THREE.ShaderMaterial({
			uniforms: {
				focus: {value: 17.5},
				time: {value: Math.random() * 100},
				scale: {value: 0.05},
				height: {value: 5.0},
				location: {value: 8.0},
			},
			side: THREE.DoubleSide,

			vertexShader: items['js/glsl/contour.vert'],
			fragmentShader: items['js/glsl/contour.frag'],

			transparent: true,
			depthWrite: false,
		})

		this.particles = new THREE.BufferGeometry()
		this.particles.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(35048))
		this.particles.setAttribute('color', new THREE.BufferAttribute(this.colors, 3).setUsage(35048))
		this.mesh = new THREE.Mesh(this.particles, this.material)

	}

	update() {
		this.material.uniforms.time.value += 0.025
		// this.cloud.geometry.attributes.position.needsUpdate = true
		// this.cloud.geometry.attributes.color.needsUpdate = true
	}
}

//--------------------------------------------------


// Text
//--------------------------------------------------

class Scaling_Textbox {
	constructor(
		message, 
		location, 
		fontSize = 32,
		fontFace = 'monospace', 
		textBaseline = 'middle',
		fillStyle = '#000000',
		textAlign = 'left',
	) {
		this.message = message
		this.location = location
		this.fontSize = fontSize
		this.fontFace = fontFace
		this.textBaseline = textBaseline
		this.filleStyle = fillStyle
		this.textAlign = textAlign
		this.canvas = document.createElement('canvas')
		this.context = this.canvas.getContext('2d')
		this.lines = ['  ']
		this.sprite = new THREE.Sprite()

		this.update()
		window.addEventListener('resize', () => {this.update()}, false)
	}

	set_context() {
		this.context.font = this.fontSize + 'px ' + this.fontFace
		this.context.textBaseline = this.textBaseline
		this.context.fillStyle = this.fillStyle
		this.context.textAlign = this.textAlign
	}

	update() {

		this.canvas.width = window.innerWidth * 1.75

		this.reflow()

		this.canvas.height = this.lines.length * this.fontSize * 2

		this.set_context()

		let starting_x = this.textAlign == 'center' ? this.canvas.width / 2 : 0

		for (let i = 0; i < this.lines.length; i++) {
			this.context.fillText(this.lines[i], starting_x, (i + 0.5) * this.canvas.height / this.lines.length)
		}

		let texture = new THREE.Texture(this.canvas)
		texture.needsUpdate = true;

		let spriteMaterial = new THREE.SpriteMaterial({map: texture});
		this.sprite.material = spriteMaterial
		this.sprite.scale.set(0.01 * this.canvas.width, 0.01 * this.canvas.height);  
		this.sprite.position.set(this.location[0], this.location[1], this.location[2])
	}

	reflow() {
		this.lines = ['  ']
		this.set_context()
		this.message.split(' ').forEach(e => {
			if (this.context.measureText(this.lines[this.lines.length - 1] + ' ' + e).width > this.canvas.width && this.lines != ['   ']) {
				this.lines.push(e)
			} else {
				this.lines[this.lines.length - 1] += ' ' + e
			}
		})
		if (this.lines.length == 1) {
			this.lines[0] = this.lines[0].trim()
		}
	}
}


var title1 = new Scaling_Textbox(
	'Lorem Ipsum',
	[0, 8, 0],
	128,
	'georgia',
	'middle',
	'#000000',
	'center',)
objects.add(title1.sprite)

var subtitle1 = new Scaling_Textbox(
	'Dolor Sit Amet',
	[0, 6.5, 0],
	64,
	'georgia',
	'middle',
	'#000000',
	'center',)
objects.add(subtitle1.sprite)

var paragraph1 = new Scaling_Textbox(
'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\
 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\
 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\
 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 
 	[0, -16, 0],
 	32,
	'georgia',
	'middle',
	'#000000',
	'left',)
objects.add(paragraph1.sprite)


//--------------------------------------------------

var stage = 0
var grid = null
var contour = null

// Operations each frame
//--------------------------------------------------

var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	// raycaster.setFromCamera(mouse, camera)

	if (stage == 0) {
		if ((retrieving[0] / retrieving[1]) == 1) {
			grid = new Grid(instances, 50)
			objects.add(grid.cloud)

			contour = new Contour(instances, 50)
			contour.mesh.position.set(0, -28, 0)
			objects.add(contour.mesh)
			stage++
		}
	} else {

		let cutoff1 = -24
		let delta1 = (vertical_target - camera.position.y) / 10

		// if (camera.position.y > cutoff1 && (camera.position.y + delta1) < cutoff1) {
		// 	grid.cloud.material = new THREE.PointsMaterial({
		// 		color: '#000000',
		// 		size: 0.05,
		// 	})
		// } else if (camera.position.y < cutoff1 && (camera.position.y + delta1) > cutoff1) {
		// 	grid.cloud.material = grid.material
		// }

		camera.position.y += (vertical_target - camera.position.y) / 10

		// if (camera.position.y > cutoff1) {
			grid.update()
			contour.update()
		// }
	}


	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()