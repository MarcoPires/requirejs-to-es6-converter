const { join, extname } = require('path');
const { cpus } = require('os');
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
	migrationPath: './migration',
	maxConsumers: cpus().length
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
		this._fileFactories = [];
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
			.then(() => this._initFactories())
			.then(() => this._setupGracefulShutdown())
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

	_initFactories() {
		let index = 0;
		const { maxConsumers } = this._options.arguments;
		
		console.log(`\n > Creating ${maxConsumers} file processors.`);

		for (index; index < maxConsumers; index++) {
			this._fileFactories.push(new FileFactory());
		};
		return this;
	}

	_setupGracefulShutdown() {
        /**
         * Task shutdown detected
         */
		process.on("SIGINT", () => this.close());

		if (process.platform !== "win32") {
			return this;
		};

		const rl = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.on("SIGINT", function () {
			process.emit("SIGINT");
		});

		return this;
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

	_checkProcessingAvailability() {
		if (!this._queue.length) {
			process.exit(0);
			return this;
		};

		return this._fileFactories.map(factory => {
			if (!factory.isAvailable()) {
				return;
			};

			this._processFile(this._queue.shift(), factory);
		});
	}

	async _processFile(filePaths, availableFactory) {
		const factory = availableFactory || this._fileFactories[0];
		
		try {
			const dependencies = await factory.process({ filePaths, options: this._options.arguments });
			this._processedFiles++;
			this._processDependencies(dependencies);
			console.log(`\n > ${this._processedFiles} files processed!`);
		} catch (error) {
			console.error(error);
		};
		return this; 
	}

	async _processDependencies(dependencies = []) {
		let index = 0;
		const { length } = dependencies

		
		for (index; index < length; index++) {
			const filePaths = this._buildFilePaths(dependencies[index]);

			this._queue.push(filePaths)
		};

		this._checkProcessingAvailability();
		return this; 
	}

	close() {
		
		this._fileFactories.map(factory => factory.close());
		delete this._queue;
		delete this._processedFiles;
		delete this._fileFactories;
		delete this._options;
		process.exit(0);
		return this;
	}
};

module.exports = new ProjectMigration();