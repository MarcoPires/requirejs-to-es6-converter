const BaseDataShifter = require("../BaseDataShifter");
const Constants = require("../../constants");


const { FILE_EXTRACTED_PARTS: {
	CODE_DEFINITION
} } = Constants;


class JsFileDataShifterBuilder extends BaseDataShifter {
	constructor(props) {
		super(props);
		return this;
	}

	async transform() {
		return new Promise(resolve => resolve(this._addExport()))
			.then(() => ({
				...this._clone(this._extractedData),
				...this._clone(this._steps),
			}));
	}

	_addExport() {
		const data = this._extractedData[CODE_DEFINITION];
		const transformedData = `export default (\`\n${data}\n\`)`;
		
		this._steps[CODE_DEFINITION] = transformedData;
		return transformedData;
	}
};


module.exports = JsFileDataShifterBuilder;