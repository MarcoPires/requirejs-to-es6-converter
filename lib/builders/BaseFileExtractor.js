const { readFile } = require("../helpers/FileHelper");

class BaseFileExtractor {
    constructor({ filePath, options }) {

        this._filePath = filePath;
        this._options = { ...options };
        this._steps = {};
        return this;
    }

    async extract() {
        return new Promise((resolve, reject) => {
            return this._startFlow()
                .then(data => resolve(data))
                .catch(error => reject(error));
        });
    }

    async _startFlow() {
        throw new Error('Method must be implemented!'); 
    }

    async _readFile() {
        return readFile(this._filePath);
    }

    _clone() {
        return Object.keys(this._steps).reduce((previousValeu, key) => {
            previousValeu[key] = this._steps[key];
            return previousValeu;
        }, {});
    }

    close() {
        Object.keys(this._steps).map(key => {
            delete this._steps[key];
        });
        delete this._steps;
        delete this._filePath;
        delete this._options;
        return this;
    }
};

module.exports = BaseFileExtractor;