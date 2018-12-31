const ExtractFileDataBuilder = require("./ExtractFileDataBuilder");
const FileDataShifterBuilder = require("./FileDataShifterBuilder");
const FileBuilder = require("../FileBuilder");
const Constants = require("../../constants");


const { FILE_EXTRACTED_PARTS: {
    CODE_DEFINITION,
    CODE_IMPORTS
} } = Constants;


exports.extractFileData = async (fileInputPath, options) => {
    try {
        let dataExtractor = new ExtractFileDataBuilder({ filePath: fileInputPath, options });
        const extractedData = await dataExtractor.extract();
        dataExtractor.close();
        dataExtractor = null;
        return extractedData;
    } catch (error) {
        console.error(' > Error extracting file data: ', error);
        return {};
    };
};

exports.transformFileData = async (filePaths, options, extractedData) => {
    try {
        let dataShifter = new FileDataShifterBuilder({ filePaths, extractedData, options });
        const transformedData = await dataShifter.transform();
        dataShifter.close();
        dataShifter = null;
        return transformedData;
    } catch (error) {
        console.error(' > Error transforming file data: ', error);
        return {};
    };
};

exports.createFile = async (filePaths, data) => {
    let dataImports = data[CODE_IMPORTS];
    dataImports = dataImports ? `${dataImports}\n\n\n` : ''

    await FileBuilder.createFile(filePaths,
        `${dataImports}${data[CODE_DEFINITION]}`);
    return data;
};