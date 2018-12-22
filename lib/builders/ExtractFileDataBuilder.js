const { readFile } = require("../helpers/FileHelper");
const { groupPathsByType } = require("../helpers/PathsHelper");
const Constants = require("../constants");
const { 
	captureBetweenDefineStatement, 
	captureBetweenStraightBrackets,
	captureBetweenCurlyBrackets, 
	captureFunctionParams,
	convertStringLikeArrayToArray } = require("../helpers/RegexHelper");


const { FILE_EXTRACTED_PARTS: {
	CODE_DEFINITION,
	MAP_FILE_PATH_TO_VARIABLE,
	REQUIRED_VARIABLES,
	REQUIRED_FILE_PATHS,
	DEFINE_STATEMENT_REMOVED,
}, DEFAULTS: {
		UNSET_IMPORT_VAR
}} = Constants;



class ExtractFileDataBuilder {
	constructor({ filePath, options }) {

		this._filePath = filePath;
		this._options = { ...options };
		this._steps = {};
		return this;
	}

	async extract() {
		return new Promise((resolve, reject) => {
			return this._startFlow()
				.then(data => resolve(data))
				.catch(error => reject(error));
		});
	}

	async _startFlow() {
		return this._readFile()
			.then(fileData => this._removeDefineStatement(fileData))
			.then(() => this._extractRequiredFilePaths())
			.then(() => this._extractRequiredVariables())
			.then(() => this._mapFilePathsToVariables())
			.then(() => this._extractCodeDefinition())
			.then(() => this._clone())
	}

	async _readFile() {
		return readFile(this._filePath);
	}

	async _removeDefineStatement(data) {
		const extractedData = captureBetweenDefineStatement(data);
		
		this._steps[DEFINE_STATEMENT_REMOVED] = extractedData;
		return extractedData;
	}

	async _extractRequiredFilePaths() {
		const data = this._steps[DEFINE_STATEMENT_REMOVED];
		const extractedData = captureBetweenStraightBrackets(data);
		const requiredFilePaths = convertStringLikeArrayToArray(extractedData);

		this._steps[REQUIRED_FILE_PATHS] = requiredFilePaths;
		return requiredFilePaths;
	}

	async _extractRequiredVariables() {
		const data = this._steps[DEFINE_STATEMENT_REMOVED];
		const extractedData = captureFunctionParams(data);
		const requiredVariables = convertStringLikeArrayToArray(extractedData);
		
		this._steps[REQUIRED_VARIABLES] = requiredVariables;
		return requiredVariables;
	}

	async _extractCodeDefinition() {
		const data = this._steps[DEFINE_STATEMENT_REMOVED];
		const extractedData = captureBetweenCurlyBrackets(data).trim();
		
		this._steps[CODE_DEFINITION] = extractedData;
		return extractedData;
	}

	_mapFilePathsToVariables() {
		const requiredVariables = this._steps[REQUIRED_VARIABLES];
		const requiredFilePaths = this._steps[REQUIRED_FILE_PATHS];
		const map = requiredFilePaths.map((path, index) => ({
			variable: requiredVariables[index] || UNSET_IMPORT_VAR,
			path
		}));
		
		
		this._steps[MAP_FILE_PATH_TO_VARIABLE] = groupPathsByType(map, this._options);
		return this._steps[MAP_FILE_PATH_TO_VARIABLE];
	}

	_clone() {
		return Object.keys(this._steps).reduce((previousValeu, key) => {
			previousValeu[key] = this._steps[key];
			return previousValeu;
		}, {});
	}

	close() {
		Object.keys(this._steps).map(key => {
			delete this._steps[key];
		});
		delete this._steps;
		delete this._filePath;
		delete this._options;
		return this;
	}
};

module.exports = ExtractFileDataBuilder;