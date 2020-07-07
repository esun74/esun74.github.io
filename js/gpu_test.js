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
// scene.background = new THREE.Color(0xCCCCCC)
scene.background = new THREE.Color(0x222222)
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.001, 1000)
camera.position.z = 8.0
//--------------------------------------------------

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

}`)

var instances = 24

const noise4D = gpu.createKernel(function(time, instances, positions) {

	let offset_x = 1000
	let offset_y = 2000
	let offset_z = 3000
	let finite_difference_amount = 0.1


	let d_x0_y = snoise([this.thread.x / instances - finite_difference_amount, this.thread.y / instances, this.thread.z / instances, time + offset_y])
	let d_x0_z = snoise([this.thread.x / instances - finite_difference_amount, this.thread.y / instances, this.thread.z / instances, time + offset_z])
	let d_x1_y = snoise([this.thread.x / instances + finite_difference_amount, this.thread.y / instances, this.thread.z / instances, time + offset_y])
	let d_x1_z = snoise([this.thread.x / instances + finite_difference_amount, this.thread.y / instances, this.thread.z / instances, time + offset_z])
	
	let d_y0_x = snoise([this.thread.x / instances, this.thread.y / instances - finite_difference_amount, this.thread.z / instances, time + offset_x])
	let d_y0_z = snoise([this.thread.x / instances, this.thread.y / instances - finite_difference_amount, this.thread.z / instances, time + offset_z])
	let d_y1_x = snoise([this.thread.x / instances, this.thread.y / instances + finite_difference_amount, this.thread.z / instances, time + offset_x])
	let d_y1_z = snoise([this.thread.x / instances, this.thread.y / instances + finite_difference_amount, this.thread.z / instances, time + offset_z])

	let d_z0_x = snoise([this.thread.x / instances, this.thread.y / instances, this.thread.z / instances - finite_difference_amount, time + offset_x])
	let d_z0_y = snoise([this.thread.x / instances, this.thread.y / instances, this.thread.z / instances - finite_difference_amount, time + offset_y])
	let d_z1_x = snoise([this.thread.x / instances, this.thread.y / instances, this.thread.z / instances + finite_difference_amount, time + offset_x])
	let d_z1_y = snoise([this.thread.x / instances, this.thread.y / instances, this.thread.z / instances + finite_difference_amount, time + offset_y])

	let curl_x = (d_y1_z - d_y0_z - d_z1_y + d_z0_y) / (2.0 * Math.E)
	let curl_y = (d_z1_x - d_z0_x - d_x1_z + d_x0_z) / (2.0 * Math.E)
	let curl_z = (d_x1_y - d_x0_y - d_y1_x + d_y0_x) / (2.0 * Math.E)

	let curl_magnitude = Math.sqrt((curl_x * curl_x) + (curl_y * curl_y) + (curl_z * curl_z)) * 100 

	curl_x /= curl_magnitude
	curl_y /= curl_magnitude
	curl_z /= curl_magnitude

	return [curl_x, curl_y, curl_z];
}).setOutput([instances, instances, instances]);

var time_started = Date.now() - (Math.random() * 50000)

//--------------------------------------------------


// Cube
//--------------------------------------------------
var material = new THREE.PointsMaterial({
		color: 0xFFBF40,
		size: .01,
		sizeAttenuation: true,
})

var geometry = new THREE.BufferGeometry()
var vertices = new Float32Array(instances * instances * instances * 3)


for (let i = 0; i < instances; i++) {
	for (let j = 0; j < instances; j++) {
		for (let k = 0; k < instances; k++) {
			let location = ((i * instances + j) * instances + k) * 3
			vertices[location + 0] = +0.0
			vertices[location + 1] = +0.0
			vertices[location + 2] = +0.0
		}
	}
}

geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))

var polygon = new THREE.Points(geometry, material)
objects.add(polygon)

//--------------------------------------------------


// Operations each frame
//--------------------------------------------------
var animate = function () {
	stats.begin()
	requestAnimationFrame(animate)
	raycaster.setFromCamera(mouse, camera)

	let values = noise4D(Math.max((Date.now() - time_started) / 5000, 0), instances, vertices)

	objects.rotation.y -= 0.002

	for (let i = 0; i < instances; i++) {
		for (let j = 0; j < instances; j++) {
			for (let k = 0; k < instances; k++) {
				let location = ((((i * instances) + j) * instances) + k) * 3

				vertices[location + 0] += values[i][j][k][0]
				vertices[location + 1] += values[i][j][k][1]
				vertices[location + 2] += values[i][j][k][2]
				vertices[location + 0] *= 0.999
				vertices[location + 1] *= 0.999
				vertices[location + 2] *= 0.999

				// if (vertices[location + 1] > 8) {
				// 	vertices[location + 0] = +0.0
				// 	vertices[location + 1] = -8.0
				// 	vertices[location + 2] = +0.0
				// } else {
				// 	vertices[location + 0] *= 0.999
				// 	vertices[location + 1] += 0.025
				// 	vertices[location + 2] *= 0.999
				// }
			}
		}
	}
	geometry.attributes.position.needsUpdate = true

	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()