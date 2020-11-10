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
// scene.background = new THREE.Color(0x101010)
var background_color = new THREE.Color(0x050505)
scene.background = background_color
// scene.fog = new THREE.Fog(background_color, 15, 20)
// scene.background = new THREE.Color(0x222222)
// scene.background = new THREE.Color(0xFFFCF2)
//--------------------------------------------------


// Setting the Camera
//--------------------------------------------------
var camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.001, 1000)
camera.position.set(4, 8, 16)
// camera.lookAt(0, 4, 8)
// //--------------------------------------------------

// Mouse Position
//--------------------------------------------------
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

function onMouseMove( event ) {
	mouse.x = + ( event.clientX / window.innerWidth ) * 2 - 1
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


// Dynamic Canvas Sizing
//--------------------------------------------------
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
	composer.setSize(window.innerWidth, window.innerHeight)
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
//--------------------------------------------------


// GPU Test
//--------------------------------------------------

const gpu = new GPU({ mode:'webgl' });

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

	vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

	vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
	vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
	float permute(float x) { return mod289(((x*34.0)+1.0)*x); }

	vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
	float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

	vec4 grad4(float j, vec4 ip) {
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

	float snoise(vec4 v) {
		const vec4  C = vec4( 	+0.138196601125011,  // (5 - sqrt(5))/20  G4
								+0.276393202250021,  // 2 * G4
								+0.414589803375032,  // 3 * G4
								-0.447213595499958); // -1 + 4 * G4

		// First corner
		vec4 i  = floor(v + dot(v, vec4(F4)));
		vec4 x0 = v -   i + dot(i, C.xxxx);

		// Other corners

		// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
		vec4 i0;
		vec3 isX = step(x0.yzw, x0.xxx);
		vec3 isYZ = step(x0.zww, x0.yyz);

		i0.x = isX.x + isX.y + isX.z;
		i0.yzw = 1.0 - isX;
		i0.y += isYZ.x + isYZ.y;
		i0.zw += 1.0 - isYZ.xy;
		i0.z += isYZ.z;
		i0.w += 1.0 - isYZ.z;

		// i0 now contains the unique values 0,1,2,3 in each channel
		vec4 i3 = clamp(i0, 0.0, 1.0);
		vec4 i2 = clamp(i0-1.0, 0.0, 1.0);
		vec4 i1 = clamp(i0-2.0, 0.0, 1.0);

		vec4 x1 = x0 - i1 + C.xxxx;
		vec4 x2 = x0 - i2 + C.yyyy;
		vec4 x3 = x0 - i3 + C.zzzz;
		vec4 x4 = x0 + C.wwww;

		// Permutations
		i = mod289(i); 
		float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
		vec4 j1 = permute( permute( permute( permute (
			  i.w + vec4(i1.w, i2.w, i3.w, 1.0))
			+ i.z + vec4(i1.z, i2.z, i3.z, 1.0))
			+ i.y + vec4(i1.y, i2.y, i3.y, 1.0))
			+ i.x + vec4(i1.x, i2.x, i3.x, 1.0));

		// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
		// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
		vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0);

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
		return 49.0 * ( dot(m0*m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
					  + dot(m1*m1, vec2(dot(p3, x3), dot(p4, x4))));
	}




	float snoise(vec3 v) { 
		const vec2  C = vec2(1.0 / 6.0, 1.0 / 3.0);
		const vec4  D = vec4(0.0 , 0.5, 1.0 , 2.0);

		// First corner
		vec3 i  = floor(v + dot(v, C.yyy));
		vec3 x0 =   v - i + dot(i, C.xxx);

		// Other corners
		vec3 g = step(x0.yzx, x0.xyz);
		vec3 l = 1.0 - g;
		vec3 i1 = min( g.xyz, l.zxy );
		vec3 i2 = max( g.xyz, l.zxy );

		vec3 x1 = x0 - i1 + C.xxx;
		vec3 x2 = x0 - i2 + C.yyy;
		vec3 x3 = x0 - D.yyy;

		// Permutations
		i = mod289(i); 
		vec4 p = permute(permute(permute( 
			  i.z + vec4(0.0, i1.z, i2.z, 1.0))
			+ i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
			+ i.x + vec4(0.0, i1.x, i2.x, 1.0));

		// Gradients: 7x7 points over a square, mapped onto an octahedron.
		// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
		float n_ = 0.142857142857; // 1.0/7.0
		vec3  ns = n_ * D.wyz - D.xzx;

		vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

		vec4 x_ = floor(j * ns.z);
		vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

		vec4 x = x_ *ns.x + ns.yyyy;
		vec4 y = y_ *ns.x + ns.yyyy;
		vec4 h = 1.0 - abs(x) - abs(y);

		vec4 b0 = vec4(x.xy, y.xy);
		vec4 b1 = vec4(x.zw, y.zw);

		vec4 s0 = floor(b0)*2.0 + 1.0;
		vec4 s1 = floor(b1)*2.0 + 1.0;
		vec4 sh = -step(h, vec4(0.0));

		vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
		vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

		vec3 p0 = vec3(a0.xy,h.x);
		vec3 p1 = vec3(a0.zw,h.y);
		vec3 p2 = vec3(a1.xy,h.z);
		vec3 p3 = vec3(a1.zw,h.w);

		//Normalise gradients
		vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
		p0 *= norm.x;
		p1 *= norm.y;
		p2 *= norm.z;
		p3 *= norm.w;

		// Mix final noise value
		vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
		m = m * m;
		return 105.0 * dot(m*m, vec4(
			dot(p0,x0), 
			dot(p1,x1), 
			dot(p2,x2), 
			dot(p3,x3)
		));
	}


	float snoise(vec2 v) {
		const vec4 C = vec4( 0.211324865405187,  // (3.0-sqrt(3.0))/6.0
							 0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
							-0.577350269189626,  // -1.0 + 2.0 * C.x
							 0.024390243902439); // 1.0 / 41.0

		// First corner
		vec2 i  = floor(v + dot(v, C.yy));
		vec2 x0 = v -   i + dot(i, C.xx);

		// Other corners
		vec2 i1;
		i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
		vec4 x12 = x0.xyxy + C.xxzz;
		x12.xy -= i1;

		// Permutations
		i = mod289(i); // Avoid truncation effects in permutation
		vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0 ));

		vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
		m = m*m;
		m = m*m;

		// Gradients: 41 points uniformly over a line, mapped onto a diamond.
		// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

		vec3 x = 2.0 * fract(p * C.www) - 1.0;
		vec3 h = abs(x) - 0.5;
		vec3 ox = floor(x + 0.5);
		vec3 a0 = x - ox;

		// Normalise gradients implicitly by scaling m
		// Approximation of: m *= inversesqrt( a0*a0 + h*h );
		m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

		// Compute final noise value at P
		vec3 g;
		g.x  = a0.x  * x0.x  + h.x  * x0.y;
		g.yz = a0.yz * x12.xz + h.yz * x12.yw;
		return 130.0 * dot(m, g);
	}`)


var instances = 64

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

const noise3D = gpu.createKernel(function(time, instances, positions) {
	let offset_x = 100
	let offset_y = 200
	let scale = 0.5

	let x_position = positions[(this.thread.x * instances + this.thread.y) * 3 + 0] / 10
	let y_position = positions[(this.thread.x * instances + this.thread.y) * 3 + 2] / 10

	return snoise([x_position * scale, y_position * scale, time * scale])

}).setOutput([instances, instances])

//--------------------------------------------------



class Grid {
	constructor(count, color, space) {
		this.count = count
		this.color = color
		this.space = space
		this.time = Math.random() * 100
		this.positions = new Float32Array(this.count * this.count * 3)
		this.values = null

		for (let i = 0; i < this.count; i++) {
			for (let j = 0; j < this.count; j++) {
				this.positions[(i * this.count + j) * 3 + 0] = ((i + 0.5) / this.count - 0.5) * space
				this.positions[(i * this.count + j) * 3 + 1] = 0
				this.positions[(i * this.count + j) * 3 + 2] = ((j + 0.5) / this.count - 0.5) * space
			}
		}

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				color: {value: new THREE.Color(this.color)},
				focus: {value: 15.0},
			},

			vertexShader: `
				uniform vec3 color;
				uniform float focus;
				varying float object_distance;

				void main() {
					object_distance = -(modelViewMatrix * vec4(position, 1.0)).z;
					gl_PointSize = min(100.0, max(5.0, pow(object_distance - focus, 2.0)));
					gl_Position = 	projectionMatrix * 
									modelViewMatrix * 
									vec4(position, 1.0);
				}
			`,

			fragmentShader: `
				uniform vec3 color;
				uniform float focus;
				varying float object_distance;

				void main() {
					if(((abs(gl_PointCoord.x - 0.5) > (4.0)) || (abs(gl_PointCoord.y - 0.5) > (sqrt(3.0) / 8.0))) ||
					 (((abs(gl_PointCoord.x - 0.5) * 4.0) + (4.0 / sqrt(3.0) * abs(gl_PointCoord.y - 0.5))) > 1.0)) {
					 	discard;
					} else {
						gl_FragColor = vec4(color, 5.0 / pow(abs(object_distance - focus), 2.75));
					}

				}
			`,

			transparent: true,
			depthWrite: false,
		})

		this.particles = new THREE.BufferGeometry()
		this.particles.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(35048))
		this.cloud = new THREE.Points(this.particles, this.material)

	}

	update() {

		this.values = noise3D(this.time, this.count, this.positions)

		for (var i = 0; i < this.count; i++) {
			for (var j = 0; j < this.count; j++) {
				this.positions[(i * this.count + j) * 3 + 1] = this.values[j][i] * 5
			}
		}

		this.time += 0.005

		this.cloud.geometry.attributes.position.needsUpdate = true
	}
}

var grid = new Grid(instances, 0x40FFC0, 50)
objects.add(grid.cloud)

//--------------------------------------------------


// Operations each frame
//--------------------------------------------------

var animate = function () {
	stats.begin()

	requestAnimationFrame(animate)
	// raycaster.setFromCamera(mouse, camera)

	grid.update()

	// postprocessing.composer.render()
	renderer.render(scene, camera)
	stats.end()
}
//--------------------------------------------------

animate()