const fs = require("fs");
const { sep } = require("path");
const { promisify } = require("util");


const asyncReadFile = promisify(fs.readFile);
const asyncMkdir = promisify(fs.mkdir);
const asyncMkFile = promisify(fs.writeFile);
const checkPath = async path => promisify(fs.stat)(path).then(res => res).catch(err => false);

const readFile = async path => asyncReadFile(path, 'utf8');
const mkFile = async (path, content = '') => asyncMkFile(path, content, 'utf8');
const mkDir = async path => {
    const partials = path.split(sep);
    const { length } = partials;
    let currentPath = ''
    let index = 0;

    for (index; index < length; index++) {
        currentPath += `${partials[index]}${sep}`
        const stat = await checkPath(currentPath);
        
        if (!stat) {
            await asyncMkdir(currentPath);
        };
    };
};


exports.readFile = readFile;
exports.mkDir = mkDir;
exports.mkFile = mkFile;