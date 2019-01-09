const { dirname, join, extname } = require("path");
const jsFiles = require("../../builders/js");
const htmlFiles = require("../../builders/html");
const jsonFiles = require("../../builders/json");
const { checkPath, filesRelativePath } = require("../../helpers/PathsHelper");
const Constants = require("../../constants");


const { FILE_EXTRACTED_PARTS: {
    MAP_FILE_PATH_TO_VARIABLE
}, FORK_PROCESS_MESSAGE_TYPE: {
    INIT, COMPLETE, ERROR, CLOSE
}, DEFAULTS: { FILE_EXTNAME } } = Constants;

const fileBuilderMap = {
    'js': jsFiles,
    'json': jsonFiles,
    'html': htmlFiles
};

const buildPaths = ({ path, ignoreFileProcessing }, inputPath, relativeOutputPath) => {
    if (ignoreFileProcessing) {
        return;
    };
    
    const relativePath = filesRelativePath(relativeOutputPath, path);
    //
    return {
        inputPath: join(dirname(inputPath), relativePath),
        relativeOutputPath: path
    };
};


class FileFactory {
    constructor(props = {}) {
        const { filePaths = {}, options = {} } = props;
        this._filePaths = filePaths;
        this._options = { ...options };
        
        console.log(`\n > processing file:\n     > input: ${this._filePaths.inputPath}\n     > output: ${this._filePaths.outputPath}`);
        return this;
    }

    async process() {

        return new Promise( async (resolve, reject) => {
            
            if (!this._filePaths.inputPath || !this._filePaths.outputPath) {
                return reject(`Required params are missing: ${JSON.stringify(props, null, 4)}`);
            };

            const alreadyProcessed = await checkPath(this._filePaths.outputPath);

            if (alreadyProcessed) {
                return resolve([]);
            };

            this._handleFileType();
            
            return this._startFlow()
                .then(data => resolve(data))
                .catch(error => {
                    console.error(error);
                    return reject(error);
                });
        });
    }

    _handleFileType() {
        const ext = (extname(this._filePaths.inputPath) || '').replace('.', '') || FILE_EXTNAME;
        
        this._fileExt = ext;
        this._fileBuilder = fileBuilderMap[ext] || fileBuilderMap[FILE_EXTNAME];
        return this;
    }

    async _startFlow() {
        return this._extractFileData()
            .then(data => this._transformFileData(data))
            .then(data => this._createFile(data))
            .then(data => this._buildDependenciesList(data))
    }

    async _extractFileData() {
        return await this._fileBuilder.extractFileData(this._filePaths.inputPath, this._options, this._fileExt);
    }

    async _transformFileData(extractedData) {
        return await this._fileBuilder.transformFileData(this._filePaths, extractedData, this._options, this._fileExt);
    }

    async _createFile(data) {
        return await this._fileBuilder.createFile(this._filePaths, data, this._options, this._fileExt);
    }

    async _buildDependenciesList(data) {
        const { paths = [], plugins = [] } = data[MAP_FILE_PATH_TO_VARIABLE] || {};
        const { inputPath, relativeOutputPath } = this._filePaths;

        return [].concat(
            paths.map(item => buildPaths(item, inputPath, relativeOutputPath)),
            plugins.map(item => buildPaths(item, inputPath, relativeOutputPath))
        );
    }

    close() {
        delete this._filePaths;
        delete this._options;
        delete this._fileBuilder;
        delete this._fileExt;
        return this;
    }
};


(() => {
    let fileFactory = null;

    const initProcess = message => {
        fileFactory = new FileFactory(message);
        fileFactory.process().then(dependencies => process.send({
            type: COMPLETE,
            message: dependencies
        })).catch(error => process.send({
            type: ERROR,
            message: error
        }));
    };

    const closeProcess = () => {
        if (!fileFactory) {
            return;
        };

        fileFactory.close();
        fileFactory = null;
    };

    const handleMessage = async ({ type, message }) => {
        switch (type) {
            case INIT:
                initProcess(message);
                break;
            case CLOSE:
                closeProcess();
                break;
        };
    };
    
    process.on('message', handleMessage);
})();


module.exports = FileFactory;