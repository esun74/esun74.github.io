function grid(size, lines) {
	var h = size * 0.5;
	var geometry = new THREE.BufferGeometry();
	var position = [];

	lines.forEach(function(x) {
		lines.forEach(function(y) {
			lines.forEach(function(z) {
					if (x === Math.max.apply(null, lines)) {
						position.push(
							+x * h, +y * h, +z * h,
							-x * h, +y * h, +z * h,

							+x * h, +y * h, -z * h,
							-x * h, +y * h, -z * h,

							+x * h, -y * h, +z * h,
							-x * h, -y * h, +z * h,

							+x * h, -y * h, -z * h,
							-x * h, -y * h, -z * h,
						)
					}
					if (y === Math.max.apply(null, lines)) {
						position.push(
							+x * h, +y * h, +z * h,
							+x * h, -y * h, +z * h,

							+x * h, +y * h, -z * h,
							+x * h, -y * h, -z * h,

							-x * h, +y * h, +z * h,
							-x * h, -y * h, +z * h,

							-x * h, +y * h, -z * h,
							-x * h, -y * h, -z * h,
						)
					}
					if (z === Math.max.apply(null, lines)) {
						position.push(
							+x * h, +y * h, +z * h,
							+x * h, +y * h, -z * h,

							+x * h, -y * h, +z * h,
							+x * h, -y * h, -z * h,

							-x * h, +y * h, +z * h,
							-x * h, +y * h, -z * h,

							-x * h, -y * h, +z * h,
							-x * h, -y * h, -z * h,
						)
					}
				// }
			});
		});
	});
	geometry.addAttribute('position', new THREE.Float32BufferAttribute(position, 3));
	return geometry;
}