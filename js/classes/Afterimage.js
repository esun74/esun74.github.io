import * as THREE from 'https://cdn.skypack.dev/three'

class Swirls {
	constructor(count, space, items) {
		this.count = count
		this.space = space
		this.segments = 1000
		this.vertices = new Float32Array(this.count * this.segments * 6)
		this.colors = new Float32Array(this.count * this.segments * 6)
		this.color_selection = [
			[
				137 / 255, 
				16 / 255, 
				31 / 255,
			], [
				186 / 255, 
				63 / 255, 
				0 / 255,
			], [
				51 / 255, 
				182 / 255, 
				234 / 255,
			], [
				0 / 255, 
				0 / 255, 
				0 / 255,
			]
		]


		for (let i = 0; i < this.count; i++) {
			let distance = Math.random() / 10
			let offset = (i - this.count) / this.count * 2 * Math.PI

			offset = [
				distance * Math.cos(offset) * (Math.random() * 0.25 + 0.75),
				distance * Math.sin(offset) * (Math.random() * 0.25 + 0.75),
			] 

			let color = Math.random()
			if (color < 0.40) {
				color = this.color_selection[0]
			} else if (color < 0.65) {
				color = this.color_selection[1]
			} else if (color < 0.97) {
				color = this.color_selection[2]
			} else {
				color = this.color_selection[3]
			}

			for (let j = 0; j < this.segments; j++) {
				this.vertices[(i * this.segments + j) * 6 + 0] = offset[0]
				this.vertices[(i * this.segments + j) * 6 + 1] = offset[1]
				this.vertices[(i * this.segments + j) * 6 + 2] = ((j - this.segments / 2 + 0) / this.segments) * this.space

				this.vertices[(i * this.segments + j) * 6 + 3] = offset[0]
				this.vertices[(i * this.segments + j) * 6 + 4] = offset[1]
				this.vertices[(i * this.segments + j) * 6 + 5] = ((j - this.segments / 2 + 1) / this.segments) * this.space

				this.colors[(i * this.segments + j) * 6 + 0] = color[0]
				this.colors[(i * this.segments + j) * 6 + 1] = color[1]
				this.colors[(i * this.segments + j) * 6 + 2] = color[2]
				this.colors[(i * this.segments + j) * 6 + 3] = color[0]
				this.colors[(i * this.segments + j) * 6 + 4] = color[1]
				this.colors[(i * this.segments + j) * 6 + 5] = color[2]
			}
		}

		this.material = new THREE.ShaderMaterial({
			uniforms: {
						focus: {value: 17.5},
						time: {value: Math.random() * 100},
						scale: {value: 0.25},
						space: {value: this.space},
						location: {value: 8.0},
						grid_size: {value: 5.0},
						grid_width: {value: 0.5},
					},
			vertexShader: items['glsl/afterimage.vert'],
			fragmentShader: items['glsl/afterimage.frag'],
			vertexColors: THREE.VertexColors,
			transparent: true,

		})

		this.geometry = new THREE.BufferGeometry()
		this.geometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3))
		this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
		this.mesh = new THREE.LineSegments(this.geometry, this.material)
		this.mesh.rotateX(-Math.PI * 0.1)

	}

	update() {
		this.material.uniforms.time.value += 0.0005
	}
}

export default Swirls
