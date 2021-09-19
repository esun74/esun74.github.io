import * as THREE from 'https://cdn.skypack.dev/three'

export default class FBO {
	constructor(size, renderer, files) {

		this.renderer = renderer

		this.scene = new THREE.Scene()
		this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1)

		this.renderTargetTexture = new THREE.WebGLRenderTarget(size, size, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
		})

		const simulation_geometry = new THREE.BufferGeometry()
		simulation_geometry.setAttribute('position', new THREE.BufferAttribute(
			new Float32Array([
				-1, -1, 0,
				 1, -1, 0,
				 1,  1, 0,

				-1, -1, 0,
				 1,  1, 0,
				-1,  1, 0
			]), 
			3
		))
		simulation_geometry.setAttribute('uv', new THREE.BufferAttribute(
			new Float32Array([
				0,1,
				1,1,
				1,0,

				0,1,
				1,0,
				0,0
			]),
			2
		))

		let length = size * size
		let data = new Float32Array(length * 4)
		for (let i = 0; i < length * 4; i += 4) {

			var phi = Math.random() * 2 * Math.PI
			var cos_theta = Math.random() * 2 - 1
			var u = Math.random()

			var theta = Math.acos(cos_theta)
			var r = 1 * Math.cbrt(u)

			data[i + 0] = r * Math.sin(theta) * Math.cos(phi)
			data[i + 1] = r * Math.sin(theta) * Math.sin(phi)
			data[i + 2] = r * Math.cos(theta)

			data[i + 3] = 0
		}

		const data_positions = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
		data_positions.needsUpdate = true

		this.simulation_material = new THREE.ShaderMaterial({
			vertexShader: files.items['glsl/simulation.vert'],
			fragmentShader: files.items['glsl/simulation.frag'],
			uniforms: {
				positions: {value: data_positions},
				time: {value: 0},
			},
			depthTest: false,
		})

		this.simulation_material.needsUpdate = true
		this.mesh = new THREE.Mesh(simulation_geometry, this.simulation_material)
		this.scene.add(this.mesh)

		let vertices = new Float32Array(length * 3)
		for (let i = 0; i < length; i++) {
			let i3 = i * 3
			vertices[i3 + 0] = (i % size) / size
			vertices[i3 + 1] = (i / size) / size
		}

		const particle_geometry = new THREE.BufferGeometry()
		particle_geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))


		this.particle_material = new THREE.ShaderMaterial({
			vertexShader: files.items['glsl/particles.vert'],
			fragmentShader: files.items['glsl/particles.frag'],
			uniforms: {
				positions: {value: data_positions},
				pointSize: {value: 1},

				a: {value: [0.5, 0.5, 0.5]},
				b: {value: [0.5, 0.5, 0.5]},
				c: {value: [1.0, 1.0, 1.0]},
				d: {value: [0.0, 0.1, 0.2]},

			},
			transparent: true,
			blending: THREE.AdditiveBlending,
		})

		this.particles = new THREE.Points(
			particle_geometry, 
			this.particle_material
		)

		this.notRenderTargetTexture = this.renderTargetTexture.clone()
		this.flip = true

		this.renderer.setRenderTarget(this.renderTargetTexture)
		this.renderer.render(this.scene, this.camera)
		this.renderer.setRenderTarget(null)
		// this.renderer.clear()

		this.time = Math.random() * 100

	}

	update() {

		this.mesh.material.uniforms.time.value = this.time
		this.time += 0.0005

		if (this.flip) {
			this.particles.material.uniforms.positions.value = this.renderTargetTexture.texture
			this.mesh.material.uniforms.positions.value = this.renderTargetTexture.texture
			this.renderer.setRenderTarget(this.notRenderTargetTexture)
		} else {
			this.particles.material.uniforms.positions.value = this.notRenderTargetTexture.texture
			this.mesh.material.uniforms.positions.value = this.notRenderTargetTexture.texture
			this.renderer.setRenderTarget(this.renderTargetTexture)
		}

		this.renderer.render(this.scene, this.camera)
		this.renderer.setRenderTarget(null)
		this.flip = !this.flip
	}
}
