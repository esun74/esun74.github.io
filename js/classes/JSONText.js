import * as THREE from 'https://cdn.skypack.dev/three@0.132.0'

export default class Text {
	constructor(files) {

		this.meshes = new THREE.Group()

		this.font_material = new THREE.ShaderMaterial({
			vertexShader: files.items['glsl/text.vert'],
			fragmentShader: files.items['glsl/text.frag'],
			uniforms: {

				c_color: {value: [255 / 255, 254 / 255, 253 / 255]},

				// a: {value: [0.5, 0.5, 0.5]},
				// b: {value: [0.5, 0.5, 0.5]},
				// c: {value: [1.0, 1.0, 1.0]},
				// d: {value: [0.0, 0.1, 0.2]},

			},
			transparent: true,
			blending: THREE.AdditiveBlending,
			// side: THREE.DoubleSide,
			// depthTest: false,
			// depthWrite: false,
		})

		for (let i in files.items['js/text.json'].content) {

			i = files.items['js/text.json'].content[i]

			let text_shape = new THREE.ShapeGeometry(files.items[i.font].generateShapes(i.text, i.size))
			text_shape.computeBoundingBox()
			text_shape.translate(
				(text_shape.boundingBox.min.x - text_shape.boundingBox.max.x) / 2 + i.x_offset, 
				(text_shape.boundingBox.max.y - text_shape.boundingBox.min.y) / 2 + i.y_offset, 
				i.z_offset
			)

			this.meshes.add(new THREE.Mesh(text_shape, this.font_material))

		}


		var misc_line_geometry = new THREE.BufferGeometry()

		misc_line_geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
			-3.2, -3.2, 0,
			+3.2, -3.2, 0,
			-3.2, -9.6, 0,
			+3.2, -9.6, 0,
			-3.2, -16., 0,
			+3.2, -16., 0,
		]), 3))

		this.meshes.add(new THREE.LineSegments(misc_line_geometry, this.font_material))

	}
}
