const { resolve, normalize, relative, dirname, sep } = require('path');
const fs = require("fs");
const { promisify } = require("util");
const { mkDir, mkFile, removeDir } = require("../FileHelper");
const GroupPathsByType = require("./GroupPathsByType");


const normalizeAndResolve = path => resolve(normalize(path));

const checkPath = async path => promisify(fs.stat)(path).then(res => res).catch(err => false);

const resolvePath = async (arg, options = {}) => {
    const path = normalizeAndResolve(arg);
    const stats = await checkPath(path);

    if (stats) {
        if (options.removeDir) {
            await removeDir(path);
        };

        options.checked = true;
        return path;
    };
    
    if (options.mkDir) {
        await mkDir(path);
        options.checked = true;
        return normalizeAndResolve(path);
    };

    if (options.mkFile) {
        await mkFile(path);
        options.checked = true;
        return normalizeAndResolve(path);
    };

    console.error(` > the supplied value for the argument ${arg} is invalid!`);
    return path;
};

const findEntryFileRelativePath = (path, rootDir) => {
    let found = false;
    const relativePath = path.split(sep).filter(partial => {
        if (found) {
            return true;
        };

        if (partial === rootDir) {
            found = true;
            return true;
        };
    }).join(sep);

    return {
        dirname: dirname(relativePath),
        relativePath
    };
};

const filesRelativePath = (from, to) => {
    const partials = relative(from, to).split(sep);
    
    partials.shift();

    if (partials[0] !== '..') {
        partials.unshift('.');
    };

    return partials.join('/');
};


exports.findEntryFileRelativePath = findEntryFileRelativePath;
exports.filesRelativePath = filesRelativePath;
exports.groupPathsByType = GroupPathsByType;
exports.resolvePath = resolvePath;
exports.checkPath = checkPath;