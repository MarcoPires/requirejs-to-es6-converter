const ExtractFileDataBuilder = require("./ExtractFileDataBuilder");
const FileDataShifterBuilder = require("./FileDataShifterBuilder");
const FileBuilder = require("../FileBuilder");
const Constants = require("../../constants");


const { FILE_EXTRACTED_PARTS: {
    CODE_DEFINITION
} } = Constants;


exports.extractFileData = async (fileInputPath, options, fileExt) => {
    try {
        let dataExtractor = new ExtractFileDataBuilder({ filePath: fileInputPath, options, fileExt });
        const extractedData = await dataExtractor.extract();
        dataExtractor.close();
        dataExtractor = null;
        return extractedData;
    } catch (error) {
        console.error(' > Error extracting file data: ', error);
        return {};
    };
};

exports.transformFileData = async (filePaths, extractedData, options, fileExt) => {
    try {
        let dataShifter = new FileDataShifterBuilder({ filePaths, extractedData, options, fileExt });
        const transformedData = await dataShifter.transform();
        dataShifter.close();
        dataShifter = null;
        return transformedData;
    } catch (error) {
        console.error(' > Error transforming file data: ', error);
        return {};
    };
};

exports.createFile = async (filePaths, data, options, fileExt) => {
    await FileBuilder.createFile(filePaths, data[CODE_DEFINITION]);
    return data;
};