

const captureBetweenDefineStatement = str => (str.match(/(?<=(define\()\s*)(.*?)(\))/gs) || [])[0] || '';

const captureBetweenStraightBrackets = str => (str.match(/(?<=(\[)\s*)(.*)(?=\s*(\]))/gs) || [])[0] || '';

const captureFunctionParams = str => (str.match(/(?<=(\()\s*)(.*?)(?=\s*(\)))/gs) || [])[0] || '';

const captureBetweenCurlyBrackets = str => (str.match(/(?<=(\{)\s*)(.*)(?=\s*(\}))/gs) || [])[0] || '';

const replaceLastReturn = (str, replacement) => str.replace(/return([^_]*)$/, `${replacement}$1`);

const captureLogString = (str, { logClassNamespace = 'console' } = {}) => {
	const regex = new RegExp(`(?<=${logClassNamespace}\\.[a-z]+\\()(.*)(?=\\)\\;?)`, 'gm');
	return str.match(regex) || [];
};

const removeLog = (str, { logClassNamespace = 'console', replacementCallback = (() => '') } = {}) => {
	const regex = new RegExp(`(?:${logClassNamespace}\\.[a-z]+\\()(.*)(?:\\)\\;?)`, 'gm');
	return str.replace(regex, replacementCallback);
};

const convertStringLikeArrayToArray = str => {
	return str.replace(/\s/g, '').replace(/\'/g, '').replace(/\"/g, '').replace(/\`/g, '').split(',');
};

const variableIsUsed = (variable, str) => {
	const regex = new RegExp(`(?<=(\\s| |\\(|\\[))${variable}(?=\\s*(\\s| |\\.|\\,|\\)|\\]|\\(|\\[))`, 'g');
	return regex.test(str);
};


exports.captureBetweenDefineStatement = captureBetweenDefineStatement;
exports.captureBetweenStraightBrackets = captureBetweenStraightBrackets;
exports.captureBetweenCurlyBrackets = captureBetweenCurlyBrackets;
exports.captureFunctionParams = captureFunctionParams;
exports.replaceLastReturn = replaceLastReturn;
exports.captureLogString = captureLogString;
exports.variableIsUsed = variableIsUsed;
exports.removeLog = removeLog;
exports.convertStringLikeArrayToArray = convertStringLikeArrayToArray;