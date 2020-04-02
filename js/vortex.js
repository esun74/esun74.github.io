document.body.addEventListener('click', () => {window.location.reload()}, true); 

// Performance Statistics
//--------------------------------------------------
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
//--------------------------------------------------

// Dynamic Canvas Sizing
//--------------------------------------------------
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);
//--------------------------------------------------

// Setting the Scene
//--------------------------------------------------
var scene = new THREE.Scene(); 
scene.background = new THREE.Color(0x111111);
// scene.background = new THREE.Color(0x000000);
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 10;
//--------------------------------------------------

// Mouse Position
//--------------------------------------------------
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener( 'mousemove', onMouseMove, false );
//--------------------------------------------------

// Configuring the Renderer and adding it to the DOM
//--------------------------------------------------
var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//--------------------------------------------------

// Creating a group to hold objects
//--------------------------------------------------
var objects = new THREE.Group();
scene.add(objects)
var central_objects = new THREE.Group();
scene.add(central_objects)
//--------------------------------------------------

// Points
//--------------------------------------------------
class Point_Cloud {
	constructor(count, color, space, speed) {
		this.count = count
		this.color = color
		this.space = space
		this.positions = new Float32Array(this.count * 3);
		this.velocity = new Float32Array(this.count * 3);

		for (var i = 0; i < this.count * 3; i++) {
			this.positions[i] = (Math.random() - 0.5) * 2 * space;
			this.velocity[i] = (Math.random() - 0.5) / 50 * speed;
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
		// 	size: 3.00,
		// 	blending: THREE.AdditiveBlending,
		// 	transparent: true,
		// 	opacity: 0.5,
		// 	sizeAttenuation: false,
		// })

		this.particles = new THREE.BufferGeometry();
		this.particles.addAttribute(
			'position', 
			new THREE.BufferAttribute(this.positions, 3).setDynamic(true)
		);
		this.cloud = new THREE.Points(this.particles, this.material)
	}

	update() {

		for (var i = 0; i < this.count; i++) {
			for (var j = 0; j < 3; j++) {
				if (Math.abs(this.positions[3 * i + j]) > this.space) {
					this.velocity[3 * i + j] = -this.velocity[3 * i + j]
				}
				this.positions[3 * i + j] += this.velocity[3 * i + j]
			}
		}

		this.cloud.geometry.attributes.position.needsUpdate = true;
	}
}

var green_cloud = new Point_Cloud(100, 0x40FFC0, 10, .1)
objects.add(green_cloud.cloud)

var red_cloud = new Point_Cloud(25, 0xFF6040, 10, .1)
objects.add(red_cloud.cloud)

var blue_cloud = new Point_Cloud(5, 0x4080FF, 10, .1)
objects.add(blue_cloud.cloud)

//--------------------------------------------------

// Lines
//--------------------------------------------------
var count = 7
var line_length = 50
var geometries = Array.from({length: count}, () => new THREE.BufferGeometry())
var line_geometries = Array.from({length: count}, () => new THREE.BufferGeometry())
var geometry_points = Array.from({length: count}, () => new Float32Array((line_length - 1) * 108))
var geometry_velocities = Array.from({length: count}, () => new Float32Array(line_length * 3))
var material = new THREE.ShaderMaterial({
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

		// void main() {
		// 	if(((abs(gl_PointCoord.x - 0.5) > (4.0)) || (abs(gl_PointCoord.y - 0.5) > (sqrt(3.0) / 8.0))) ||
		// 	 (((abs(gl_PointCoord.x - 0.5) * 4.0) + (4.0 / sqrt(3.0) * abs(gl_PointCoord.y - 0.5))) > 1.0)) {
		// 		gl_FragColor = vec4(color, (0.5 - length(gl_PointCoord - vec2(0.5, 0.5))) * min(1.0, 10.0 / pow(object_distance, 1.75)));
		// 	} else {
		// 		gl_FragColor = vec4(color, 7.5 / pow(object_distance, 1.75));
		// 	}

		// }

		void main() {

			gl_FragColor = vec4(color, min(1.0, pow(object_distance, 2.5) / 2000.0));

		}
	`,

	transparent: true,
	depthWrite: false,
})


// var material = new THREE.MeshBasicMaterial({
// 	color: 0xFFAA00,
// })

var geometry_lines = []
var radius = 0.1
var distance = 0.05
var tightness = 0.2
var separation = 5

for (var i = 0; i < count; i++) {
	geometry_velocities[i][0] = (i == 0 && count > 6) ? 0 : (distance * radius * Math.cos(Math.PI / 3 * i))
	geometry_velocities[i][1] = -15.0
	geometry_velocities[i][2] = (i == 0 && count > 6) ? 0 : (distance * radius * Math.sin(Math.PI / 3 * i))
	for (var j = 0; j < line_length - 1; j++) {

		geometry_velocities[i][3 * (j + 1) + 0] = (i == 0 && count > 6) ? 0 : (distance * (radius + (separation * j)) * Math.cos(Math.PI / 3 * (i - (tightness * j))))
		geometry_velocities[i][3 * (j + 1) + 1] = geometry_velocities[i][3 * j + 1] + (j == 0 ? 10 : 0.5)
		geometry_velocities[i][3 * (j + 1) + 2] = (i == 0 && count > 6) ? 0 : (distance * (radius + (separation * j)) * Math.sin(Math.PI / 3 * (i - (tightness * j))))



		var angle_1 = Math.PI / 3 * 1
		var angle_2 = Math.PI / 3 * 2

		for (var k = 0; k < 6; k++) {

			angle_1 = Math.PI / 3 * (k + 0)
			angle_2 = Math.PI / 3 * (k + 1)

			geometry_points[i][(108 * j) + (18 * k) + 0] = geometry_velocities[i][(3 * (j + 1)) + 0] + (radius * Math.cos(angle_1))
			geometry_points[i][(108 * j) + (18 * k) + 1] = geometry_velocities[i][(3 * (j + 1)) + 1]
			geometry_points[i][(108 * j) + (18 * k) + 2] = geometry_velocities[i][(3 * (j + 1)) + 2] + (radius * Math.sin(angle_1))

			geometry_points[i][(108 * j) + (18 * k) + 3] = geometry_velocities[i][(3 * (j + 1)) + 0] + (radius * Math.cos(angle_2))
			geometry_points[i][(108 * j) + (18 * k) + 4] = geometry_velocities[i][(3 * (j + 1)) + 1]
			geometry_points[i][(108 * j) + (18 * k) + 5] = geometry_velocities[i][(3 * (j + 1)) + 2] + (radius * Math.sin(angle_2))

			geometry_points[i][(108 * j) + (18 * k) + 6] = geometry_velocities[i][(3 * (j + 0)) + 0] + (radius * Math.cos(angle_2))
			geometry_points[i][(108 * j) + (18 * k) + 7] = geometry_velocities[i][(3 * (j + 0)) + 1]
			geometry_points[i][(108 * j) + (18 * k) + 8] = geometry_velocities[i][(3 * (j + 0)) + 2] + (radius * Math.sin(angle_2))



			geometry_points[i][(108 * j) + (18 * k) + 9] = geometry_velocities[i][(3 * (j + 1)) + 0] + (radius * Math.cos(angle_1))
			geometry_points[i][(108 * j) + (18 * k) + 10] = geometry_velocities[i][(3 * (j + 1)) + 1]
			geometry_points[i][(108 * j) + (18 * k) + 11] = geometry_velocities[i][(3 * (j + 1)) + 2] + (radius * Math.sin(angle_1))

			geometry_points[i][(108 * j) + (18 * k) + 12] = geometry_velocities[i][(3 * (j + 0)) + 0] + (radius * Math.cos(angle_2))
			geometry_points[i][(108 * j) + (18 * k) + 13] = geometry_velocities[i][(3 * (j + 0)) + 1]
			geometry_points[i][(108 * j) + (18 * k) + 14] = geometry_velocities[i][(3 * (j + 0)) + 2] + (radius * Math.sin(angle_2))

			geometry_points[i][(108 * j) + (18 * k) + 15] = geometry_velocities[i][(3 * (j + 0)) + 0] + (radius * Math.cos(angle_1))
			geometry_points[i][(108 * j) + (18 * k) + 16] = geometry_velocities[i][(3 * (j + 0)) + 1]
			geometry_points[i][(108 * j) + (18 * k) + 17] = geometry_velocities[i][(3 * (j + 0)) + 2] + (radius * Math.sin(angle_1))

		}



	}

	geometries[i].addAttribute('position', new THREE.BufferAttribute(geometry_points[i], 3))

	geometry_lines.push(new THREE.Mesh(geometries[i], material))
	central_objects.add(geometry_lines[i])

	line_geometries[i].addAttribute('position', new THREE.BufferAttribute(geometry_velocities[i], 3))
	central_objects.add(new THREE.Line(line_geometries[i], new THREE.MeshBasicMaterial({color: 0xFF6040})))
}



//--------------------------------------------------

var direction = Math.random() > 0.5

// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin();
	requestAnimationFrame(animate);
	raycaster.setFromCamera(mouse, camera);

	objects.rotation.x = Math.min(0.5, Math.max(-0.5, (objects.rotation.x + ((Math.sign(objects.rotation.x) == Math.sign(mouse.y) ? (0.5 - Math.abs(objects.rotation.x)) : (0.5)) * mouse.y * 0.01))))
	objects.rotation.y = Math.min(0.5, Math.max(-0.5, (objects.rotation.y - ((Math.sign(objects.rotation.y) != Math.sign(mouse.x) ? (0.5 - Math.abs(objects.rotation.y)) : (0.5)) * mouse.x * 0.01))))


	central_objects.rotation.y -= 0.002
	// if (direction) {
	// 	objects.rotation.y += 0.02
	// } else {
	// 	objects.rotation.y -= 0.02
	// }
	
	green_cloud.update()
	red_cloud.update()





	renderer.render(scene, camera);
	stats.end();
};
//--------------------------------------------------

animate();