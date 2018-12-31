const BaseDataShifter = require("../BaseDataShifter");
const { join, extname } = require("path");
const Constants = require("../../constants");
const { filesRelativePath } = require("../../helpers/PathsHelper");


const { FILE_EXTRACTED_PARTS: {
	CODE_DEFINITION,
	CODE_IMPORTS,
	MAP_FILE_PATH_TO_VARIABLE
}, DEFAULTS: {
	UNSET_IMPORT_VAR
}} = Constants;

const fixLineTabSize = line => {
	const length = 4;
	let index = 0

	for (index; index < length; index++) {
		if (line.charAt(0) !== ' ') {
			break;
		};
		line = line.substr(1);
	};
	return line;
};

const handleImportsDeclarationType = (variable, path) => {
	if (!path) {
		return '';
	};

	if (variable === UNSET_IMPORT_VAR) {
		return `import '${path}';`;
	};

	return `import ${variable} from '${path}';`;
};

const createImportsDeclaration = (paths, { variable, path, rootRelative }) => {
	if (!rootRelative) {
		return handleImportsDeclarationType(variable, path);
	};

	const absolutePath = join(paths.outputRootDir, path);
	const relativePath = filesRelativePath(paths.outputPath, absolutePath);
	const ext = extname(relativePath) || '';

	return handleImportsDeclarationType(variable, relativePath.replace(ext, ''));
};


class JsFileDataShifterBuilder extends BaseDataShifter {
	constructor(props) {
		super(props);
		return this;
	}

	async transform() {
		return new Promise(resolve => resolve(this._changeTabSize()))
			.then(() => this._replaceReturnWithExport())
			.then(() => this._createAliasImports())
			.then(() => this._createPathRelativeImports())
			.then(() => this._createPluginsImports())
			.then(() => this._steps[CODE_IMPORTS] = this._steps[CODE_IMPORTS].join('\n'))
			.then(() => ({
				...this._clone(this._extractedData),
				...this._clone(this._steps),
			}));
	}

	_changeTabSize() {
		const data = this._extractedData[CODE_DEFINITION];
		const lines = data.split('\n');
		const transformedData = lines.map(fixLineTabSize).join('\n');

		this._steps[CODE_DEFINITION] = transformedData;
		return transformedData;
	}

	_replaceReturnWithExport() {
		const data = this._steps[CODE_DEFINITION];
		const lines = data.split('\n');
		const lastLine = (lines.pop()).replace(/return/g, 'export default');

		lines.push(lastLine);
		this._steps[CODE_DEFINITION] = lines.join('\n');
		return this._steps[CODE_DEFINITION];
	}

	_createAliasImports() {
		const filePaths = this._filePaths;
		const { alias } = this._extractedData[MAP_FILE_PATH_TO_VARIABLE];
		const transformedData = alias.map(item => createImportsDeclaration(filePaths, item));

		this._steps[CODE_IMPORTS] = (this._steps[CODE_IMPORTS] || []).concat(transformedData);
		return transformedData;
	}

	_createPluginsImports() {
		const filePaths = this._filePaths;
		const { plugins } = this._extractedData[MAP_FILE_PATH_TO_VARIABLE];
		const transformedData = plugins.map(item => createImportsDeclaration(filePaths, item));

		this._steps[CODE_IMPORTS] = (this._steps[CODE_IMPORTS] || []).concat(transformedData);
		return transformedData;
	}

	_createPathRelativeImports() {
		const filePaths = this._filePaths;
		const { paths } = this._extractedData[MAP_FILE_PATH_TO_VARIABLE];
		const transformedData = paths.map(item => createImportsDeclaration(filePaths, item));

		this._steps[CODE_IMPORTS] = (this._steps[CODE_IMPORTS] || []).concat(transformedData);
		return transformedData;
	}
};


module.exports = JsFileDataShifterBuilder;