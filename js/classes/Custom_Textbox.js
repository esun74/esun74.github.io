class Custom_Textbox {
	constructor(
		message, 
		location, 
		fontSize = 32,
		fontFace = 'monospace', 
		textBaseline = 'middle',
		fillStyle = '#000000',
		textAlign = 'left',
	) {
		this.message = message
		this.location = location
		this.fontSize = fontSize
		this.fontFace = fontFace
		this.textBaseline = textBaseline
		this.filleStyle = fillStyle
		this.textAlign = textAlign
		this.canvas = document.createElement('canvas')
		this.context = this.canvas.getContext('2d')
		this.lines = ['  ']
		this.sprite = new THREE.Sprite()

		this.update()
		window.addEventListener('resize', () => {this.update()}, false)
	}

	set_context() {
		this.context.font = this.fontSize + 'px ' + this.fontFace
		this.context.textBaseline = this.textBaseline
		this.context.fillStyle = this.fillStyle
		this.context.textAlign = this.textAlign
	}

	update() {

		this.canvas.width = window.innerWidth * 1.75

		this.reflow()

		this.canvas.height = this.lines.length * this.fontSize * 2

		this.set_context()

		let starting_x = this.textAlign == 'center' ? this.canvas.width / 2 : 0

		for (let i = 0; i < this.lines.length; i++) {
			this.context.fillText(this.lines[i], starting_x, (i + 0.5) * this.canvas.height / this.lines.length)
		}

		let texture = new THREE.Texture(this.canvas)
		texture.needsUpdate = true;

		let spriteMaterial = new THREE.SpriteMaterial({map: texture});
		this.sprite.material = spriteMaterial
		this.sprite.scale.set(0.01 * this.canvas.width, 0.01 * this.canvas.height);  
		this.sprite.position.set(this.location[0], this.location[1], this.location[2])
	}

	reflow() {
		this.lines = ['  ']
		this.set_context()
		this.message.split(' ').forEach(e => {
			if (this.context.measureText(this.lines[this.lines.length - 1] + ' ' + e).width > this.canvas.width && this.lines != ['   ']) {
				this.lines.push(e)
			} else {
				this.lines[this.lines.length - 1] += ' ' + e
			}
		})
		if (this.lines.length == 1) {
			this.lines[0] = this.lines[0].trim()
		}
	}
}

export default Custom_Textbox
