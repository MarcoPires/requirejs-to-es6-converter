const { join, extname } = require('path');
const ArgsHelper = require("./helpers/ArgumentsHelper");
const { findEntryFileRelativePath } = require("./helpers/PathsHelper");
const ArgumentsValidator = require("./validators/ArgumentsValidator");
const FileFactory = require("./factories/FileFactory");


/*
 - ex:
node index.js configFile=./config
 */
const defaults = () => ({
	migrationPath: './migration'
});

const buildArgs = async (args) => {
	let configFile = {};
	
	if (args.configFile) {
		configFile = require(args.configFile);
	};

	const extendedArgs = { ...defaults(), ...configFile, ...args };
	
	return await ArgumentsValidator.validate(extendedArgs, [
		/* { key: 'entryFilePath', contains: 'ui-building-helper' }, */
		{ key: 'entryFilePath' },
		{ key: 'projectRootDir' },
		{ key: 'migrationPath', mkDir: true }
	]);
};


class ProjectMigration {
	constructor() {

		this.init();
		return this;
	}

	async init() {
		return new Promise((resolve, reject) => {
			return this._startFlow()
				.then(data => resolve(data))
				.catch(error => reject(error));
		});
	}

	async _startFlow() {
		return this._setOptions()
			.then(() => this._processFile({
				inputPath: this._options.entryFile.inputPath,
				outputPath: this._options.entryFile.outputPath,
				outputRootDir: this._options.entryFile.outputRootDir,
				projectRelativePath: this._options.entryFile.projectRelativePath
			}))
	}

	async _setOptions() {
		const { args, rootDir } = ArgsHelper();
		const extendedArgs = await buildArgs(args);
		const entryFilePaths = this._buildEntryFilePaths(extendedArgs);
		const options = {
			rootDir,
			entryFile: {
				inputPath: extendedArgs.entryFilePath,
				outputRootDir: extendedArgs.migrationPath,
				outputPath: entryFilePaths.absoluteFilePath,
				outputDirPath: entryFilePaths.absoluteDirPath,
				outputRelativePath: entryFilePaths.relativePath,
				projectRelativePath: entryFilePaths.projectDirRelativePath
			},
			arguments: extendedArgs
		};

		this._options = options
		return options;
	}

	_buildEntryFilePaths(options) {
		const { entryFilePath, projectRootDir, migrationPath } = options;
		const { relativePath, dirname } = findEntryFileRelativePath(entryFilePath, projectRootDir);

		return {
			relativePath,
			projectDirRelativePath: join(projectRootDir, relativePath),
			absoluteDirPath: join(migrationPath, dirname),
			absoluteFilePath: join(migrationPath, relativePath)
		}
	}

	async _processFile(filePaths) {
		let fileFactory = new FileFactory({ filePaths, options: this._options.arguments });
		const dependencies = await fileFactory.process();
		fileFactory.close();
		fileFactory = null;
		return await this._processDependencies(dependencies);
	}

	async _processDependencies(dependencies = []) {
		let index = 0;
		const { length } = dependencies
		const { migrationPath } = this._options.arguments;
		
		for (index; index < length; index++) {
			const { inputPath, relativeOutputPath, projectRelativePath } = dependencies[index];
			const ext = extname(inputPath);
			const filePaths = {
				relativeOutputPath,
				inputPath: `${inputPath}${ext ? '' : '.js'}`,
				outputPath: join(migrationPath, `${relativeOutputPath}${ext ? '' : '.js'}`),
				outputRootDir: migrationPath,
				projectRelativePath
			};

			await this._processFile(filePaths);
		}
	}
};

module.exports = new ProjectMigration();