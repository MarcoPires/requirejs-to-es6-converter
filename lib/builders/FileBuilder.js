const { dirname } = require('path');
const { mkDir, mkFile } = require("../helpers/FileHelper");


class FileBuilder {
	constructor() {
		return this;
	}

	static async createFile(filePaths, fileContent) {
		const { outputPath } = filePaths;

		return mkDir(dirname(outputPath))
			.catch(error => {
				if (error.code === 'EEXIST') {
					return;
				};

				console.log(error);
			})
			.then(() => mkFile(outputPath, fileContent))

	}
};

module.exports = FileBuilder;