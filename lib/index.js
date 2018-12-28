const { resolve, join, extname } = require('path');
const ArgsHelper = require("./helpers/ArgumentsHelper");
const { findEntryFileRelativePath } = require("./helpers/PathsHelper");
const ArgumentsValidator = require("./validators/ArgumentsValidator");
/* const FileFactory = require("./factories/FileFactory"); */
const FileFactory = require("./factories/FileFactory/forkProcess");



/*
 - ex:
node ./lib/index.js configFile=./config
 */
const defaults = () => ({
	migrationPath: './migration'
});

const buildArgs = async (cwd, args) => {
	let configFile = {};
	
	if (args.configFile) {
		configFile = require(join(cwd, args.configFile));
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

		this._processedFiles = 0;
		this._queue = [];
		this._fileFactories = [ 
			new FileFactory()
		];
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
		const { args, cwd, rootDir } = ArgsHelper();
		const extendedArgs = await buildArgs(cwd, args);
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

	_buildFilePaths({ inputPath, relativeOutputPath, projectRelativePath }) {
		const { migrationPath } = this._options.arguments;
		const ext = extname(inputPath);

		return {
			relativeOutputPath,
			inputPath: `${inputPath}${ext ? '' : '.js'}`,
			outputPath: join(migrationPath, `${relativeOutputPath}${ext ? '' : '.js'}`),
			outputRootDir: migrationPath,
			projectRelativePath
		};
	}

	/*async _processFile(filePaths) {
		let fileFactory = new FileFactory({ filePaths, options: this._options.arguments });
		const dependencies = await fileFactory.process();
		fileFactory.close();
		fileFactory = null; 
		//return await this._processDependencies(dependencies);
	}*/

	async _processFile(filePaths) {
		
		const dependencies = await this._fileFactories[0].process({ filePaths, options: this._options.arguments });
		this._processedFiles++;
		this._processDependencies(dependencies);
		console.log(this._processedFiles);
		return this; 
	}

	async _processDependencies(dependencies = []) {
		let index = 0;
		const { length } = dependencies
		
		
		for (index; index < length; index++) {
			const filePaths = this._buildFilePaths(dependencies[index]);

			this._queue.push(filePaths)
			//await this._processFile(filePaths);
		}
		return this; 
	}
};

module.exports = new ProjectMigration();