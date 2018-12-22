const { resolvePath } = require('../helpers/PathsHelper');


const validate = async (args = {}, argsSetup = []) => {

	let accumulator = { ...args };
	let options = {};
	let index = 0
	const { length } = argsSetup;

	for (index; index < length; index++) {
		options = argsSetup[index];
		const { key, contains } = options;
		
		if (accumulator[key] === undefined) {
			return console.error(`Missing argument ${key} required!`);
		};

		if (key.toLocaleLowerCase().includes('path')) {
			accumulator[key] = await resolvePath(accumulator[key], options);
		};

		if (contains && !accumulator[key].includes(contains)) {
			return console.error(`the supplied value for the argument ${key} is invalid!`);
		};
	};

	return accumulator;
};


exports.validate = validate;