class Something {
	constructor(count, space, items) {
		this.count = count
		this.space = space

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				focus: {value: 17.5},
				time: {value: Math.random() * 100},
				scale: {value: 0.05},
				height: {value: 5.0},
			},
			side: THREE.DoubleSide,

			vertexShader: items['glsl/experiment.vert'],
			fragmentShader: items['glsl/experiment.frag'],

			transparent: true,
			depthWrite: false,
		})

		this.geometry = new THREE.PlaneBufferGeometry(this.space * 5, this.space * 2, this.count, this.count)
		this.geometry.rotateY(Math.PI / 2)
		this.mesh = new THREE.Mesh(this.geometry, this.material)

	}

	update() {
		this.material.uniforms.time.value += 0.025
	}
}

export default Something
