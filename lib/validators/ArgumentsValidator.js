const { resolvePath } = require('../helpers/PathsHelper');


const validateItem = async (item, propName, options) => {
	
	if (!options) {
		return item;
	};

	const { checkPath, contains } = options;

	if (item === undefined) {
		console.error(` > Missing argument ${propName} required!`);
		return undefined;
	};

	if (contains !== undefined && !item.includes(contains)) {
		console.error(`> the supplied value for the argument ${propName} is invalid!`);
		return undefined;
	};

	if (checkPath) {
		return await resolvePath(item, options);
	};

	options.checked = true;
	return item;
};

const handleObject = async (args, options, parentPath) => {
	let key = '';
	let object = {};

	for (key in args) {
		const path = `${parentPath}${parentPath ? '.': ''}${key}`;
		
		object[key] = await crawl(args[key], options, path);
		object[key] = await validateItem(object[key], key, options[path]);
	};

	return object;
};

const handleArray = async (args, options, parentPath) => {
	const { length } = args;
	let index = 0
	let array = [];

	for (index; index < length; index++) {
		array.push(await crawl(args[index], options, parentPath));
	};

	return array;
};

const crawl = async (data, options, parentPath = '') => {
	
	if (Array.isArray(data)) {
		return await handleArray(data, options, parentPath);
	};

	if (typeof data === 'object') {
		return await handleObject(data, options, parentPath);
	};

	if (typeof data === 'function') {
		return data.toString()
	};
	
	return data;
};


const validate = async (args = {}, argsSetup = {}) => {
	const newArgs = await crawl(args, argsSetup);
	const argsList = Object.keys(argsSetup);
	const validArgs = argsList.filter(key => {
		const { checked } = argsSetup[key];
		
		if (!checked) {
			console.error(` > the supplied value for the argument ${key} is invalid!`);
		};

		return checked;
	});
	
	if (validArgs.length < argsList.length) {
		throw new Error(` > ${validArgs.length} / ${argsList.length} arguments are invalid`);
	};
	
	return newArgs;
};


exports.validate = validate;