const { dirname, resolve } = require("path");

module.exports = () => {
	const rootDir = dirname(resolve(process.argv[1]))
	const argsList = process.argv.slice(2);
	const args = argsList.reduce((previousValue, arg) => {
		const keyValueList = arg.split('=');
		const key = keyValueList[0];
		let value = keyValueList[1];

		if (!key || !value) {
			return previousValue;
		};

		if (value.indexOf(',') > -1) {
			value = value.replace('[', '').replace(']', '').split(',');
		};

		previousValue[key] = value;
		return previousValue;
	}, {});

	return {
		cwd: resolve('./'),
		rootDir,
		args
	}
};