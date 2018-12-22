

const captureBetweenDefineStatement = str => (str.match(/(?<=(define\()\s*)(.*?)(\))/gs) || [])[0] || '';
const captureBetweenStraightBrackets = str => (str.match(/(?<=(\[)\s*)(.*)(?=\s*(\]))/gs) || [])[0] || '';
const captureFunctionParams = str => (str.match(/(?<=(\()\s*)(.*?)(?=\s*(\)))/gs) || [])[0] || '';
const captureBetweenCurlyBrackets = str => (str.match(/(?<=(\{)\s*)(.*)(?=\s*(\}))/gs) || [])[0] || '';
const replaceLastReturn = (str, replacement) => str.replace(/return([^_]*)$/, `${replacement}$1`);

const convertStringLikeArrayToArray = str => {
	return str.replace(/\s/g, '').replace(/\'/g, '').replace(/\"/g, '').replace(/\`/g, '').split(',');
};

exports.captureBetweenDefineStatement = captureBetweenDefineStatement;
exports.captureBetweenStraightBrackets = captureBetweenStraightBrackets;
exports.captureBetweenCurlyBrackets = captureBetweenCurlyBrackets;
exports.captureFunctionParams = captureFunctionParams;
exports.replaceLastReturn = replaceLastReturn;
exports.convertStringLikeArrayToArray = convertStringLikeArrayToArray;