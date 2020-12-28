class Grid {
	constructor(count, space, items) {
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
				time: {value: Math.random() * 100 * 0},
				scale: {value: 0.05},
				height: {value: 5.0},
				location: {value: 8.0},
			},

			vertexShader: items['glsl/field.vert'],
			fragmentShader: items['glsl/field.frag'],

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

export default Grid
