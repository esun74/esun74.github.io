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
// //--------------------------------------------------
// import {OrbitControls} from './OrbitControls.js'
// var controls = new OrbitControls(camera, renderer.domElement)
//--------------------------------------------------


// GPU Test
//--------------------------------------------------

const gpu = new GPU();

gpu.addNativeFunction('snoise', `
//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
  }
						
// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}


`)

var instances = 8

const noise4D = gpu.createKernel(function(time, instances, positions, normalized) {

	let offset_x = 100
	let offset_y = 200
	let offset_z = 300
	let finite_difference_amount = 0.01
	let scale = 0.1

	let x_position = positions[((this.thread.x * instances + this.thread.y) * instances + this.thread.z) * 3 + 0] / 10
	let y_position = positions[((this.thread.x * instances + this.thread.y) * instances + this.thread.z) * 3 + 1] / 10
	let z_position = positions[((this.thread.x * instances + this.thread.y) * instances + this.thread.z) * 3 + 2] / 10

	let d_x0_y = snoise([x_position - finite_difference_amount, y_position, z_position, time + offset_y])
	let d_x0_z = snoise([x_position - finite_difference_amount, y_position, z_position, time + offset_z])
	let d_x1_y = snoise([x_position + finite_difference_amount, y_position, z_position, time + offset_y])
	let d_x1_z = snoise([x_position + finite_difference_amount, y_position, z_position, time + offset_z])
	
	let d_y0_x = snoise([x_position, y_position - finite_difference_amount, z_position, time + offset_x])
	let d_y0_z = snoise([x_position, y_position - finite_difference_amount, z_position, time + offset_z])
	let d_y1_x = snoise([x_position, y_position + finite_difference_amount, z_position, time + offset_x])
	let d_y1_z = snoise([x_position, y_position + finite_difference_amount, z_position, time + offset_z])

	let d_z0_x = snoise([x_position, y_position, z_position - finite_difference_amount, time + offset_x])
	let d_z0_y = snoise([x_position, y_position, z_position - finite_difference_amount, time + offset_y])
	let d_z1_x = snoise([x_position, y_position, z_position + finite_difference_amount, time + offset_x])
	let d_z1_y = snoise([x_position, y_position, z_position + finite_difference_amount, time + offset_y])

	let curl_x = (d_y1_z - d_y0_z - d_z1_y + d_z0_y) / (2.0 * finite_difference_amount)
	let curl_y = (d_z1_x - d_z0_x - d_x1_z + d_x0_z) / (2.0 * finite_difference_amount)
	let curl_z = (d_x1_y - d_x0_y - d_y1_x + d_y0_x) / (2.0 * finite_difference_amount)

	let curl_magnitude = Math.sqrt((curl_x * curl_x) + (curl_y * curl_y) + (curl_z * curl_z))

	curl_x /= curl_magnitude
	curl_y /= curl_magnitude
	curl_z /= curl_magnitude

	if (normalized) {
		curl_x = Math.round(curl_x)
		curl_y = Math.round(curl_y)
		curl_z = Math.round(curl_z)
	}



	return [curl_x * scale, curl_y * scale, curl_z * scale]
}).setOutput([instances, instances, instances])

var time_started = Date.now() - (Math.random() * 50000)

//--------------------------------------------------


// Cube
//--------------------------------------------------
// var material = new THREE.PointsMaterial({
// 		// color: 0xFFBF40,
// 		color: 0x333333,
// 		size: .1,
// 		sizeAttenuation: false,
// 		blending: THREE.SubtractiveBlending,
// })

// var geometry = new THREE.BufferGeometry()
var vertices = new Float32Array(instances * instances * instances * 3)
// geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))

for (let i = 0; i < instances; i++) {
	for (let j = 0; j < instances; j++) {
		for (let k = 0; k < instances; k++) {
			let location = ((i * instances + j) * instances + k) * 3
			vertices[location + 0] = (i - instances / 2 + 0.5) * (5 / instances)
			vertices[location + 1] = (j - instances / 2 + 0.5) * (5 / instances)
			vertices[location + 2] = (k - instances / 2 + 0.5) * (5 / instances)
		}
	}
}


// var polygon = new THREE.Points(geometry, material)
// objects.add(polygon)


var line_length = 350
var line_geometry = new THREE.BufferGeometry()
var line_vertices = new Float32Array(instances * instances * instances * line_length * 6)
var line_colors = new Float32Array(instances * instances * instances * line_length * 6)
var line_colors_start = new Float32Array(instances * instances * instances * 3)
line_geometry.addAttribute('position', new THREE.BufferAttribute(line_vertices, 3))
line_geometry.addAttribute('color', new THREE.BufferAttribute(line_colors, 3))

for (let i = 0; i < instances; i++) {
	for (let j = 0; j < instances; j++) {
		for (let k = 0; k < instances; k++) {
			let original_location = ((i * instances + j) * instances + k) * 3

			// line_colors_start[original_location + 0] = 0.20
			// line_colors_start[original_location + 1] = 0.30
			// line_colors_start[original_location + 2] = 0.50

			line_colors_start[original_location + 0] = 0.10 + (0.10 * Math.random())
			line_colors_start[original_location + 1] = 0.20 + (0.10 * Math.random())
			line_colors_start[original_location + 2] = 0.30 + (0.10 * Math.random())


			for(let l = 0; l < line_length * 2; l++) {
				let location = (((i * instances + j) * instances + k) * line_length + l) * 6
				
				line_vertices[location + 0] = vertices[original_location + 0]
				line_vertices[location + 1] = vertices[original_location + 1]
				line_vertices[location + 2] = vertices[original_location + 2]
				line_vertices[location + 3] = vertices[original_location + 0]
				line_vertices[location + 4] = vertices[original_location + 1]
				line_vertices[location + 5] = vertices[original_location + 2]

				let this_color = Math.random() > 0.96
				line_colors[location + 0] = this_color ? 1.0 : line_colors_start[original_location + 0]
				line_colors[location + 1] = this_color ? 1.0 : line_colors_start[original_location + 1]
				line_colors[location + 2] = this_color ? 1.0 : line_colors_start[original_location + 2]
				line_colors[location + 3] = line_colors_start[original_location + 0]
				line_colors[location + 4] = line_colors_start[original_location + 1]
				line_colors[location + 5] = line_colors_start[original_location + 2]

			}
		}
	}
}


var lineSegments = new THREE.LineSegments(
	line_geometry, 
	new THREE.LineBasicMaterial({
		vertexColors: THREE.VertexColors,
		// color: 0x505050,
		blending: THREE.AdditiveBlending,
		// blending: THREE.SubtractiveBlending,
		// blending: THREE.MultiplyBlending,
}));

objects.add(lineSegments);






//--------------------------------------------------

// Instanced Geometry (https://codepen.io/mnmxmx/pen/rzqoeW)
//--------------------------------------------------

// var edge_color = 0xFF002C

// var fill_colors = [0xB3D9FF, 0xFFF6B3, 0xFFB3C5]
// var other_fill_colors = [0xFFBCC4, 0xC4FFBC, 0xBCCBFF, 0xFFD9BC]

// var original_object = new THREE.OctahedronBufferGeometry(1, 0)
// var instanced_geometries = new THREE.InstancedBufferGeometry()

// var instanced_vertices = original_object.attributes.position.clone()
// instanced_geometries.addAttribute('position', instanced_vertices)

// var instanced_normals = original_object.attributes.normal.clone()
// instanced_geometries.addAttribute('normal', instanced_normals)

// var instanced_uvs = original_object.attributes.uv.clone()
// instanced_geometries.addAttribute('uv', instanced_uvs)

// instanced_geometries.maxInstanceCount = instances * instances

// var nums = new THREE.InstancedBufferAttribute(new Float32Array(instances * instances * 1), 1, true, 1)
// var randoms = new THREE.InstancedBufferAttribute(new Float32Array(instances * instances * 1), 1, true,  1)
// var colors = new THREE.InstancedBufferAttribute(new Float32Array(instances * instances * 3), 3, true,  1)


// for(let i = 0; i < nums.count; i++){
// 	var _color = fill_colors[Math.floor(Math.random() * fill_colors.length)];

// 	nums.setX(i, i);
// 	randoms.setX(i, Math.random() * 0.5 + 1);
// 	colors.setXYZ(i, _color.r, _color.g, _color.b);
// }

// instanced_geometries.addAttribute("aNum", nums);
// instanced_geometries.addAttribute("aRandom", randoms);
// instanced_geometries.addAttribute("aColor", colors);

// var scale = {
// 	x: 2, 
// 	y: 8,
// 	z: 2
// }


//--------------------------------------------------


// Operations each frame
//--------------------------------------------------

var seed = Math.random() * 100
var extend = null
var reset = null
var location = 0
var line_location = 0
var normalized = false
var values = null

var animate = function () {
	stats.begin()
	objects.rotation.y -= 0.001
	requestAnimationFrame(animate)
	raycaster.setFromCamera(mouse, camera)

	extend = null
	reset = null

	for (let i = 0; i < instances; i++) {
		for (let j = 0; j < instances; j++) {
			for (let k = 0; k < instances; k++) {
				location = ((i * instances + j) * instances + k) * 3
				line_location = ((i * instances + j) * instances + k) * line_length + line_length

				if (extend === null) {
					extend =   ((line_vertices[(line_location - 100) * 6 + 0] === line_vertices[(line_location - 1) * 6 + 0]) & 
								(line_vertices[(line_location - 100) * 6 + 1] === line_vertices[(line_location - 1) * 6 + 1]) & 
								(line_vertices[(line_location - 100) * 6 + 2] === line_vertices[(line_location - 1) * 6 + 2]))
					if (extend) {
						values = noise4D(seed, instances, vertices, normalized)
					}
				}

				if (extend) {
					if (reset === null) {
						reset =    ((line_vertices[(line_location - 1) * 6 + 0] != (i - instances / 2 + 0.5) * (5 / instances)) | 
									(line_vertices[(line_location - 1) * 6 + 1] != (j - instances / 2 + 0.5) * (5 / instances)) | 
									(line_vertices[(line_location - 1) * 6 + 2] != (k - instances / 2 + 0.5) * (5 / instances)))
						if (reset) {
							seed += Math.random() * 10
							normalized = !normalized
						}
					}

					if (reset) {

						vertices[location + 0] = (i - instances / 2 + 0.5) * (5 / instances)
						vertices[location + 1] = (j - instances / 2 + 0.5) * (5 / instances)
						vertices[location + 2] = (k - instances / 2 + 0.5) * (5 / instances)

						for (let l = 0; l < line_length; l++) {
							line_location = (((i * instances + j) * instances + k) * line_length + l) * 6

							line_vertices[line_location + 0] = vertices[location + 0]
							line_vertices[line_location + 1] = vertices[location + 1]
							line_vertices[line_location + 2] = vertices[location + 2]
							line_vertices[line_location + 3] = vertices[location + 0]
							line_vertices[line_location + 4] = vertices[location + 1]
							line_vertices[line_location + 5] = vertices[location + 2]
						}
					} else {
						vertices[location + 0] += values[k][j][i][0]
						vertices[location + 1] += values[k][j][i][1]
						vertices[location + 2] += values[k][j][i][2]
					}
				}


				for (let l = line_length - 1; l > 0; l--) {
					line_location = (((i * instances + j) * instances + k) * line_length + l) * 6

					line_vertices[line_location + 0] = line_vertices[line_location - 6]
					line_vertices[line_location + 1] = line_vertices[line_location - 5]
					line_vertices[line_location + 2] = line_vertices[line_location - 4]
					line_vertices[line_location + 3] = line_vertices[line_location - 3]
					line_vertices[line_location + 4] = line_vertices[line_location - 2]
					line_vertices[line_location + 5] = line_vertices[line_location - 1]

				}

				// for (let l = 0; l < line_length - 1; l++) {
				// 	line_location = (((i * instances + j) * instances + k) * line_length + l) * 6


				// 	line_colors[line_location + 0] = line_colors[line_location + 6]
				// 	line_colors[line_location + 1] = line_colors[line_location + 7]
				// 	line_colors[line_location + 2] = line_colors[line_location + 8]
				// 	line_colors[line_location + 3] = line_colors[line_location + 9]
				// 	line_colors[line_location + 4] = line_colors[line_location + 10]
				// 	line_colors[line_location + 5] = line_colors[line_location + 11]
				// }

				line_location = (((i * instances + j) * instances + k) * line_length) * 6

				line_vertices[line_location + 5] = line_vertices[line_location + 2]
				line_vertices[line_location + 4] = line_vertices[line_location + 1]
				line_vertices[line_location + 3] = line_vertices[line_location + 0]
				line_vertices[line_location + 2] = vertices[location + 2]
				line_vertices[line_location + 1] = vertices[location + 1]
				line_vertices[line_location + 0] = vertices[location + 0]

				// line_location = (((i * instances + j) * instances + k) * line_length + line_length - 1) * 6

				// let this_color = Math.random() > 0.995
				// line_colors[line_location + 0] = this_color ? 1.00 : (normalized ? 0.10 : 0.10)
				// line_colors[line_location + 1] = this_color ? 1.00 : (normalized ? 0.35 : 0.30)
				// line_colors[line_location + 2] = this_color ? 1.00 : (normalized ? 0.65 : 0.45)
				// line_colors[line_location + 3] = (normalized ? 0.10 : 0.10)
				// line_colors[line_location + 4] = (normalized ? 0.35 : 0.30)
				// line_colors[line_location + 5] = (normalized ? 0.65 : 0.45)


			}
		}
	}
	line_geometry.attributes.position.needsUpdate = true
	// line_geometry.attributes.color.needsUpdate = true

	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()