const { dirname, join, relative } = require("path");
const ExtractFileDataBuilder = require("../../builders/ExtractFileDataBuilder");
const FileDataShifterBuilder = require("../../builders/FileDataShifterBuilder");
const FileBuilder = require("../../builders/FileBuilder");
const { removeProjectDirFromPath, removeProjectDirFromPaths, fixNodeRelativePath } = require("../../helpers/PathsHelper");
const Constants = require("../../constants");


const { FILE_EXTRACTED_PARTS: {
    CODE_DEFINITION,
    CODE_IMPORTS,
    MAP_FILE_PATH_TO_VARIABLE
}} = Constants;


class FileFactory {
    constructor({ filePaths, options } = {}) {

        this._filePaths = filePaths;
        this._options = { ...options };

        console.log('\n > processing file: ');
        console.log('     > input: ', this._filePaths.inputPath);
        console.log('     > output: ', this._filePaths.outputPath);
        
        return this;
    }

    async process() {
        return new Promise((resolve, reject) => {
            return this._startFlow()
                .then(data => resolve(data))
                .catch(error => reject(error));
        });
    }

    async _startFlow() {
        return this._extractFileData()
            .then(data => this._transformFileData(data))
            .then(data => this._createFile(data))
            .then(data => this._buildDependenciesList(data))
    }

    async _extractFileData() {
        let dataExtractor = new ExtractFileDataBuilder({ filePath: this._filePaths.inputPath, options: this._options });
        const extractedData = await dataExtractor.extract();
        dataExtractor.close();
        dataExtractor = null;
        return extractedData;
    }

    async _transformFileData(extractedData) {
        let dataShifter = new FileDataShifterBuilder({ filePaths: this._filePaths, extractedData, options: this._options });
        const transformedData = await dataShifter.transform();
        dataShifter.close();
        dataShifter = null;
        return transformedData;
    }

    async _createFile(data) {
        await FileBuilder.createFile(this._filePaths,
            `${data[CODE_IMPORTS]}\n\n\n${data[CODE_DEFINITION]}`);
        return data;
    }

    async _buildDependenciesList(data) {
        const { paths } = data[MAP_FILE_PATH_TO_VARIABLE];
        const { projectRootDir } = this._options;
        const { inputPath, outputRootDir, outputPath, projectRelativePath } = this._filePaths;
        const inputPaths = paths.map(({ path }) => {
            const relativePath = fixNodeRelativePath(relative(projectRelativePath, path));
            
            return {
                inputPath: join(dirname(inputPath), relativePath),
                relativeOutputPath: removeProjectDirFromPath({ path }, { sep: '/' }).path,
                projectRelativePath: path
            }
        });

        /* return removeProjectDirFromPaths(paths, { sep: '/' }).reduce((previousValue, { path }, index) => {
            const absolutePath = join(outputRootDir, path);
            const relativePath = fixNodeRelativePath(relative(outputPath, absolutePath));

            previousValue[index].relativeOutputPath = relativePath;
            return previousValue;
        }, inputPaths); */
        return inputPaths
    }

    close() {
        delete this._filePaths;
        delete this._options;
        return this;
    }
};


(() => {
    console.log('hehehe');
    
    process.on('message', async ({ type, message }) => {
        let fileFactory = null;

        switch (type) {
            case 'INIT':
                fileFactory = new FileFactory(message);
                process.send({ 
                    type: 'COMPLETE', 
                    message: await fileFactory.process()
                });
                break;

            case 'CLOSE':
                if (!fileFactory) {
                    return;
                };

                fileFactory.close();
                fileFactory = null;
                break;
        };
    })
})();


module.exports = FileFactory;