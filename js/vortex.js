
// Performance Statistics
//--------------------------------------------------
var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
document.body.addEventListener('click', () => {window.location.reload()}, true)
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
// scene.background = new THREE.Color(0x111111)
scene.background = new THREE.Color(0x222222)
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.z = 10
camera.rotation.y = .25
//--------------------------------------------------

// Mouse Position
//--------------------------------------------------
// var raycaster = new THREE.Raycaster()
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
objects.rotation.y = -0.75
var central_objects = new THREE.Group()
objects.add(central_objects)
//--------------------------------------------------

// Points
//--------------------------------------------------
class Point_Cloud {
	constructor(count, color, space, speed) {
		this.count = count
		this.color = color
		this.space = space
		this.bounce = true
		this.positions = new Float32Array(this.count * 3)
		this.velocity = new Float32Array(this.count * 3)

		for (var i = 0; i < this.count * 3; i++) {
			this.positions[i] = (Math.random() - 0.5) * 2 * space
			this.velocity[i] = (Math.random() - 0.5) / 50 * speed
		}


		this.material = new THREE.ShaderMaterial({
			uniforms: {
				color: {value: new THREE.Color(this.color)},
			},

			vertexShader: `
				uniform vec3 color;
				varying float object_distance;

				void main() {
					object_distance = -(modelViewMatrix * vec4(position, 1.0)).z;
					gl_PointSize = max(10.0, pow(object_distance / 1.5, 2.0));
					gl_Position = 	projectionMatrix * 
									modelViewMatrix * 
									vec4(position, 1.0);
				}
			`,

			fragmentShader: `
				uniform vec3 color;
				varying float object_distance;

				void main() {
					if(((abs(gl_PointCoord.x - 0.5) > (4.0)) || (abs(gl_PointCoord.y - 0.5) > (sqrt(3.0) / 8.0))) ||
					 (((abs(gl_PointCoord.x - 0.5) * 4.0) + (4.0 / sqrt(3.0) * abs(gl_PointCoord.y - 0.5))) > 1.0)) {
						gl_FragColor = vec4(color, (0.5 - length(gl_PointCoord - vec2(0.5, 0.5))) * min(1.0, 10.0 / pow(object_distance, 1.75)));
					} else {
						gl_FragColor = vec4(color, 7.5 / pow(object_distance, 1.75));
					}

				}
			`,

			transparent: true,
			depthWrite: false,
		})

		// this.material = new THREE.PointsMaterial({
		// 	color: this.color,
		// 	size: 3.0,
		// 	blending: THREE.AdditiveBlending,
		// 	// transparent: true,
		// 	// opacity: 0.75,
		// 	sizeAttenuation: false,
		// })

		this.particles = new THREE.BufferGeometry()
		this.particles.addAttribute(
			'position', 
			new THREE.BufferAttribute(this.positions, 3).setDynamic(true)
		)
		this.cloud = new THREE.Points(this.particles, this.material)
	}

	update() {

		for (var i = 0; i < this.count; i++) {
			for (var j = 0; j < 3; j++) {
				if (Math.abs(this.positions[3 * i + j]) > this.space) {
					if (this.bounce) {
						this.velocity[3 * i + j] = -this.velocity[3 * i + j]
					} else {
						this.positions[3 * i + j] = -this.positions[3 * i + j]
					}
					
				}
				this.positions[3 * i + j] += this.velocity[3 * i + j]
			}
		}

		this.cloud.geometry.attributes.position.needsUpdate = true
	}
}

var green_cloud = new Point_Cloud(100, 0x40FFC0, 10, .1)
objects.add(green_cloud.cloud)

var red_cloud = new Point_Cloud(10, 0xFF6040, 10, .1)
objects.add(red_cloud.cloud)

var blue_cloud = new Point_Cloud(10, 0x4080FF, 10, .1)
objects.add(blue_cloud.cloud)

//--------------------------------------------------

// Lines
//--------------------------------------------------

class Spiral_Funnel {
	constructor(group, count, line_length, radius, distance, tightness, separation, number_of_particles, distance_traveled_per_frame) {
		this.count = count
		this.line_length = line_length
		this.radius = radius
		this.distance = distance
		this.tightness = tightness
		this.separation = separation
		this.number_of_particles = number_of_particles

		this.geometry_lines = []
		this.geometries = Array.from({length: this.count}, () => new THREE.BufferGeometry())
		this.line_geometries = Array.from({length: this.count}, () => new THREE.BufferGeometry())
		this.geometry_points = Array.from({length: this.count}, () => new Float32Array((this.line_length - 1) * 108))
		this.geometry_cores = Array.from({length: this.count}, () => new Float32Array(this.line_length * 3))
		this.line_material = new THREE.ShaderMaterial({
			uniforms: {
				color: {value: new THREE.Color(0xFFBF40)},
				widthFactor: {value: 3},
			},

			vertexShader: `
				uniform vec3 color;
				varying float object_distance;

				void main() {
					object_distance = -(modelViewMatrix * vec4(position, 1.0)).z;
					gl_Position = 	projectionMatrix * 
									modelViewMatrix * 
									vec4(position, 1.0);
				}
			`,

			fragmentShader: `
				uniform vec3 color;
				varying float object_distance;

				void main() {
					gl_FragColor = vec4(color, min(1.0, pow(object_distance, 3.0) / 6400.0));

				}
			`,

			transparent: true,
			depthWrite: false,
		})

		this.particles =  new THREE.BufferGeometry()

		this.positions = new Float32Array(this.number_of_particles * 3)
		this.distance_traveled_per_frame = distance_traveled_per_frame
		this.line_choices = [...Array(this.number_of_particles)].map(x => Math.floor(Math.random() * this.count))
		this.line_locations = [...Array(this.number_of_particles)].map(x => Math.floor(Math.random() * this.line_length))

		this.point_material = new THREE.ShaderMaterial({
			uniforms: {
				color: {value: new THREE.Color(0xFFFFFF)},
			},

			vertexShader: `
				uniform vec3 color;
				varying float object_distance;

				void main() {
					object_distance = -(modelViewMatrix * vec4(position, 1.0)).z;
					gl_PointSize = 1000.0 / pow(object_distance, 1.75);
					gl_Position = 	projectionMatrix * 
									modelViewMatrix * 
									vec4(position, 1.0);
				}
			`,

			fragmentShader: `
				uniform vec3 color;
				varying float object_distance;

				void main() {
					if(((abs(gl_PointCoord.x - 0.5) > (4.0)) || (abs(gl_PointCoord.y - 0.5) > (sqrt(3.0) / 8.0))) ||
					 (((abs(gl_PointCoord.x - 0.5) * 4.0) + (4.0 / sqrt(3.0) * abs(gl_PointCoord.y - 0.5))) > 1.0)) {
						gl_FragColor = vec4(color, (0.5 - length(gl_PointCoord - vec2(0.5, 0.5))) * min(1.0, 10.0 / pow(object_distance, 1.75)));
					} else {
						gl_FragColor = vec4(color, 7.5 / pow(object_distance, 1.75));
					}

				}
			`,

			transparent: true,
			depthWrite: false,
		})

		for (var i = 0; i < this.count; i++) {
			this.geometry_cores[i][0] = (i == 0 && this.count > 6) ? 0 : (this.distance * this.radius * Math.cos(Math.PI / 3 * i))
			this.geometry_cores[i][1] = -15.0
			this.geometry_cores[i][2] = (i == 0 && this.count > 6) ? 0 : (this.distance * this.radius * Math.sin(Math.PI / 3 * i))
			for (var j = 0; j < this.line_length - 1; j++) {

				this.geometry_cores[i][3 * (j + 1) + 0] = (i == 0 && this.count > 6) ? 0 : (this.distance * (this.radius + (this.separation * j)) * Math.cos(Math.PI / 3 * (i - (this.tightness * j))))
				this.geometry_cores[i][3 * (j + 1) + 1] = this.geometry_cores[i][3 * j + 1] + (j == 0 ? 10 : 0.5)
				this.geometry_cores[i][3 * (j + 1) + 2] = (i == 0 && this.count > 6) ? 0 : (this.distance * (this.radius + (this.separation * j)) * Math.sin(Math.PI / 3 * (i - (this.tightness * j))))

				var angle_1 = Math.PI / 3 * 1
				var angle_2 = Math.PI / 3 * 2

				for (var k = 0; k < 6; k++) {

					angle_1 = Math.PI / 3 * (k + 0)
					angle_2 = Math.PI / 3 * (k + 1)

					this.geometry_points[i][(108 * j) + (18 * k) + 0] = this.geometry_cores[i][(3 * (j + 1)) + 0] + (this.radius * Math.cos(angle_1))
					this.geometry_points[i][(108 * j) + (18 * k) + 1] = this.geometry_cores[i][(3 * (j + 1)) + 1]
					this.geometry_points[i][(108 * j) + (18 * k) + 2] = this.geometry_cores[i][(3 * (j + 1)) + 2] + (this.radius * Math.sin(angle_1))
					this.geometry_points[i][(108 * j) + (18 * k) + 3] = this.geometry_cores[i][(3 * (j + 1)) + 0] + (this.radius * Math.cos(angle_2))
					this.geometry_points[i][(108 * j) + (18 * k) + 4] = this.geometry_cores[i][(3 * (j + 1)) + 1]
					this.geometry_points[i][(108 * j) + (18 * k) + 5] = this.geometry_cores[i][(3 * (j + 1)) + 2] + (this.radius * Math.sin(angle_2))
					this.geometry_points[i][(108 * j) + (18 * k) + 6] = this.geometry_cores[i][(3 * (j + 0)) + 0] + (this.radius * Math.cos(angle_2))
					this.geometry_points[i][(108 * j) + (18 * k) + 7] = this.geometry_cores[i][(3 * (j + 0)) + 1]
					this.geometry_points[i][(108 * j) + (18 * k) + 8] = this.geometry_cores[i][(3 * (j + 0)) + 2] + (this.radius * Math.sin(angle_2))
					this.geometry_points[i][(108 * j) + (18 * k) + 9] = this.geometry_cores[i][(3 * (j + 1)) + 0] + (this.radius * Math.cos(angle_1))
					this.geometry_points[i][(108 * j) + (18 * k) + 10] = this.geometry_cores[i][(3 * (j + 1)) + 1]
					this.geometry_points[i][(108 * j) + (18 * k) + 11] = this.geometry_cores[i][(3 * (j + 1)) + 2] + (this.radius * Math.sin(angle_1))
					this.geometry_points[i][(108 * j) + (18 * k) + 12] = this.geometry_cores[i][(3 * (j + 0)) + 0] + (this.radius * Math.cos(angle_2))
					this.geometry_points[i][(108 * j) + (18 * k) + 13] = this.geometry_cores[i][(3 * (j + 0)) + 1]
					this.geometry_points[i][(108 * j) + (18 * k) + 14] = this.geometry_cores[i][(3 * (j + 0)) + 2] + (this.radius * Math.sin(angle_2))
					this.geometry_points[i][(108 * j) + (18 * k) + 15] = this.geometry_cores[i][(3 * (j + 0)) + 0] + (this.radius * Math.cos(angle_1))
					this.geometry_points[i][(108 * j) + (18 * k) + 16] = this.geometry_cores[i][(3 * (j + 0)) + 1]
					this.geometry_points[i][(108 * j) + (18 * k) + 17] = this.geometry_cores[i][(3 * (j + 0)) + 2] + (this.radius * Math.sin(angle_1))

				}
			}

			this.geometries[i].addAttribute('position', new THREE.BufferAttribute(this.geometry_points[i], 3))

			this.geometry_lines.push(new THREE.Mesh(this.geometries[i], this.line_material))
			group.add(this.geometry_lines[i])

			this.line_geometries[i].addAttribute('position', new THREE.BufferAttribute(this.geometry_cores[i], 3))
			group.add(new THREE.Line(this.line_geometries[i], new THREE.MeshBasicMaterial({color: 0xFF6040})))
		}


		for (var i = 0; i < this.number_of_particles; i++) {
			for (var j = 0; j < 3; j++) {
				this.positions[3 * i + j] = this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + j]
			}
		}

		this.particles.addAttribute(
			'position', 
			new THREE.BufferAttribute(this.positions, 3).setDynamic(true)
		)
		this.cloud = new THREE.Points(this.particles, this.point_material)
		group.add(this.cloud)
	}

	update() {
		for (var i = 0; i < this.number_of_particles; i++) {
			var travel_distance = this.distance_traveled_per_frame
			while (travel_distance > 0) {
				var distance_to_next_point = Math.sqrt(
					Math.pow(this.positions[3 * i + 0] - this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 0], 2) + 
					Math.pow(this.positions[3 * i + 1] - this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 1], 2) + 
					Math.pow(this.positions[3 * i + 2] - this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 2], 2)
				)
				if (distance_to_next_point == 0) {
					this.line_locations[i] = (this.line_locations[i] < 0) ? this.line_length - 2 : this.line_locations[i] - 1
				} else if (travel_distance < distance_to_next_point) {
					this.positions[3 * i + 0] += (this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 0] - this.positions[3 * i + 0]) * (travel_distance / distance_to_next_point)
					this.positions[3 * i + 1] += (this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 1] - this.positions[3 * i + 1]) * (travel_distance / distance_to_next_point)
					this.positions[3 * i + 2] += (this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 2] - this.positions[3 * i + 2]) * (travel_distance / distance_to_next_point)
					travel_distance = 0

				} else {
					this.positions[3 * i + 0] = this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 0]
					this.positions[3 * i + 1] = this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 1]
					this.positions[3 * i + 2] = this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + 2]
					this.line_locations[i] = (this.line_locations[i] < 0) ? this.line_length - 2 : this.line_locations[i] - 1
					travel_distance -= distance_to_next_point
				}
			}

			for (var x = 0; x < 3; x++) {
				if (isNaN(this.positions[3 * i + x])) {
					this.positions[3 * i + x] = this.geometry_cores[this.line_choices[i]][3 * this.line_locations[i] + x]
				}
			}
			
		}

		this.cloud.geometry.attributes.position.needsUpdate = true
	}
}

var spiral = new Spiral_Funnel(central_objects, 3, 50, 0.1, 0.05, 0.2, 5, 100, 0.1)


//--------------------------------------------------

// State
//--------------------------------------------------
var state = 'Index'
//--------------------------------------------------


// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	// raycaster.setFromCamera(mouse, camera)

	if (state == 'Index') {
		objects.rotation.y += 0.75
		objects.rotation.x = Math.min(0.05, Math.max(-0.05, (objects.rotation.x + (((Math.sign(objects.rotation.x) == Math.sign(mouse.y) ? (0.05 - Math.abs(objects.rotation.x)) : (0.05)) * mouse.y * 0.01) * 7.5))))
		objects.rotation.y = Math.min(0.5, Math.max(-0.5, (objects.rotation.y - ((Math.sign(objects.rotation.y) != Math.sign(mouse.x) ? (0.5 - Math.abs(objects.rotation.y)) : (0.5)) * mouse.x * 0.01)))) - 0.75

		central_objects.rotation.y -= 0.01
		
		green_cloud.update()
		red_cloud.update()
		blue_cloud.update()

		spiral.update()
	}

	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()