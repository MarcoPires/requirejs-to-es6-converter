const BaseFileExtractor = require("../BaseFileExtractor");
const Constants = require("../../constants");

const { FILE_EXTRACTED_PARTS: {
    ORIGINAL,
    CODE_DEFINITION
} } = Constants;


class ExtractJsFileDataBuilder extends BaseFileExtractor {
    constructor(props) {
        super(props);
        return this;
    }

    async _startFlow() {
        return this._readFile()
            .then(fileData => this._extractCodeDefinition(fileData))
            .then(() => this._clone())
    }
    
    _extractCodeDefinition(data) {
        this._steps[ORIGINAL] = data;
        this._steps[CODE_DEFINITION] = data;
        return data;
    }
};


module.exports = ExtractJsFileDataBuilder;