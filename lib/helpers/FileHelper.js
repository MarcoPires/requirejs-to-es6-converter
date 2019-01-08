const fs = require("fs");
const { join, sep } = require("path");
const { promisify } = require("util");


const asyncReadFile = promisify(fs.readFile);
const asyncMkdir = promisify(fs.mkdir);
const asyncMkFile = promisify(fs.writeFile);
const asyncUnlink = promisify(fs.unlink);
const asyncLstat = promisify(fs.lstat);
const asyncRmdir = promisify(fs.rmdir);
const asyncReaddir = promisify(fs.readdir);
const checkPath = async path => asyncLstat(path).then(res => res).catch(err => false);

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

const removeDirFiles = async (files, dirPath) => await Promise.all(files.map(async (file) => {
    try {
        const filePath = join(dirPath, file);
        const stat = await checkPath(filePath);

        if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
            return await removeDir(filePath);
        };

        await asyncUnlink(filePath);
        return;
    } catch (error) {
        console.error(error);
    };
}));

const removeDir = async (dirPath) => {
    try {
        const stat = await checkPath(dirPath);
        
        if (stat && stat.isSymbolicLink()) {
            return await unlink(dirPath);
        };

        await removeDirFiles(await asyncReaddir(dirPath), dirPath);
        await asyncRmdir(dirPath);
        return;
    } catch (error) {
        console.error(error);
    };
};


exports.readFile = readFile;
exports.mkDir = mkDir;
exports.mkFile = mkFile;
exports.removeDir = removeDir;
exports.removeDirFiles = removeDirFiles;