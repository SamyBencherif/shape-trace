const path = require('path');

module.exports = {
	entry: './js/scene.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'entry.bundle.js'
	}
};