class JsFileDataShifterBuilder {
	constructor({ filePaths, extractedData, options }) {

		this._filePaths = filePaths;
		this._extractedData = extractedData;
		this._options = { ...options };
		this._steps = {};
		return this;
	}

	async transform() {
		throw new Error('Method must be implemented!'); 
	}

	_clone(data) {
		return Object.keys(data).reduce((previousValeu, key) => {
			previousValeu[key] = data[key];
			return previousValeu;
		}, {});
	}

	close() {
		Object.keys(this._steps).map(key => {
			delete this._steps[key];
		});
		Object.keys(this._extractedData).map(key => {
			delete this._extractedData[key];
		});
		delete this._extractedData;
		delete this._steps;
		delete this._filePaths;
		delete this._options;
		return this;
	}
};


module.exports = JsFileDataShifterBuilder;