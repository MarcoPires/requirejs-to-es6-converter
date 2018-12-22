const { join, relative } = require("path");
const Constants = require("../constants");
const { removeProjectDirFromPaths, fixNodeRelativePath } = require("../helpers/PathsHelper");


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

const handleImportsDeclarationType = (variable, paht) => {
	if (variable === UNSET_IMPORT_VAR) {
		return `import '${paht}';`;
	};

	return `import ${variable} from '${paht}';`;
};

const createImportsDeclaration = (paths, { variable, path, rootRelative }) => {
	if (!rootRelative) {
		return handleImportsDeclarationType(variable, path);
	};

	const absolutePath = join(paths.outputRootDir, path);
	const relativePath = fixNodeRelativePath(relative(paths.outputPath, absolutePath));

	return handleImportsDeclarationType(variable, relativePath);
};


class FileDataShifterBuilder {
	constructor({ filePaths, extractedData, options }) {

		this._filePaths = filePaths;
		this._extractedData = extractedData;
		this._options = { ...options };
		this._steps = {};
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
		const fixedPaths = removeProjectDirFromPaths(paths, { sep: '/' });
		const transformedData = fixedPaths.map(item => createImportsDeclaration(filePaths, item));

		this._steps[CODE_IMPORTS] = (this._steps[CODE_IMPORTS] || []).concat(transformedData);
		return transformedData;
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

module.exports = FileDataShifterBuilder;