const BaseFileExtractor = require("../BaseFileExtractor");
const { groupPathsByType } = require("../../helpers/PathsHelper");
const Constants = require("../../constants");
const { 
	captureBetweenDefineStatement, 
	captureBetweenStraightBrackets,
	captureBetweenCurlyBrackets, 
	captureFunctionParams,
	convertStringLikeArrayToArray } = require("../../helpers/RegexHelper");


const { FILE_EXTRACTED_PARTS: {
	ORIGINAL,
	CODE_DEFINITION,
	MAP_FILE_PATH_TO_VARIABLE,
	REQUIRED_VARIABLES,
	REQUIRED_FILE_PATHS,
	DEFINE_STATEMENT_REMOVED,
}, DEFAULTS: {
		UNSET_IMPORT_VAR
}} = Constants;


class ExtractJsFileDataBuilder extends BaseFileExtractor{
	constructor(props) {
		super(props);
		return this;
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

	async _removeDefineStatement(data) {
		const extractedData = captureBetweenDefineStatement(data);
		
		this._steps[ORIGINAL] = data;
		this._steps[DEFINE_STATEMENT_REMOVED] = extractedData;
		return extractedData;
	}

	async _extractRequiredFilePaths() {
		const data = this._steps[DEFINE_STATEMENT_REMOVED];
		const extractedData = captureBetweenStraightBrackets(data).trim();
		const requiredFilePaths = convertStringLikeArrayToArray(extractedData);

		this._steps[REQUIRED_FILE_PATHS] = requiredFilePaths;
		return requiredFilePaths;
	}

	async _extractRequiredVariables() {
		const data = this._steps[DEFINE_STATEMENT_REMOVED];
		const extractedData = captureFunctionParams(data).trim();
		const requiredVariables = convertStringLikeArrayToArray(extractedData);
		
		this._steps[REQUIRED_VARIABLES] = requiredVariables;
		return requiredVariables;
	}

	async _extractCodeDefinition() {
		const data = this._steps[ORIGINAL];
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
};


module.exports = ExtractJsFileDataBuilder;