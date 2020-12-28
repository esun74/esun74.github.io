class Retriever {
	constructor(item_list) {
		this.items = {}
		this.retrieving = [0, 0]

		this.get_items(item_list)
	}

	retrieve(target, path) {
		let req = new XMLHttpRequest()

		req.onreadystatechange = () => {
			if (req.readyState === 4) {
				console.log('Received ' + path)
				target[path] = req.response
				this.retrieving[0]++
			}
		};

		console.log('Requested ' + path)
		req.open('GET', path, true)
		req.send()
		this.retrieving[1]++
	}

	get_items(item_list) {
		item_list.forEach(e => this.retrieve(this.items, e))
	}
}

export default Retriever
