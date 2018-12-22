const fs = require("fs");
const { join, sep } = require("path");
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
/* 
const removeDirFiles = async (files, dirPath, debug) => await Promise.all(files.map(async (file) => {
    try {
        const filePath = join(dirPath, file);
        const stat = await lstat(filePath);

        if (stat.isDirectory() && !stat.isSymbolicLink()) {
            return await removeDir(filePath);
        };

        await unlink(filePath);
        debug && logInfo(`Removed file ${filePath}`);
        return;
    } catch (err) {
        logError(err);
    };
}));

const removeDir = async (dirPath, debug) => {
    try {
        const stat = await lstat(dirPath);

        if (stat.isSymbolicLink()) {
            return await unlink(dirPath);
        };

        await removeDirFiles(await readdir(dirPath), dirPath, debug);
        await rmdir(dirPath);
        debug && logInfo(`Removed dir ${dirPath}`);
        return;
    } catch (err) {
        logError(err);
    };
}; */