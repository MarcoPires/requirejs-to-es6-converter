const { resolve, normalize, dirname, sep } = require('path');
const fs = require("fs");
const { promisify } = require("util");
const { mkDir, mkFile } = require("../FileHelper");
const GroupPathsByType = require("./GroupPathsByType");


const normalizeAndResolve = path => resolve(normalize(path));

const checkPath = async path => promisify(fs.stat)(path).then(res => res).catch(err => false);;

const resolvePath = async (arg, options = {}) => {
    const path = normalizeAndResolve(arg);
    const stats = await checkPath(path);

    if (stats) {
        return path;
    };

    if (options.mkDir) {
        await mkDir(path);
        return normalizeAndResolve(path);
    };

    if (options.mkFile) {
        await mkFile(path);
        return normalizeAndResolve(path);
    };

    console.error(`the supplied value for the argument ${arg} is invalid!`);
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
            return false;
        };
    }).join(sep);

    return {
        dirname: dirname(relativePath),
        relativePath
    };
};

const removeProjectDirFromPath = (item, options = {}) => {
    const { path } = item;
    const slash = options.sep || sep;
    const projectDir = options.projectDir;
    const partials = path.split(slash);

    if (!projectDir || (projectDir && partials[0] === projectDir)) {
        partials.shift();
    }

    return {
        ...item,
        path: partials.join(slash)
    }
};

const removeProjectDirFromPaths = (paths, options) => paths.map(item => removeProjectDirFromPath(item, options));

const fixNodeRelativePath = path => {
    const partials = path.split(sep);

    partials.shift();

    if (partials[0] !== '..') {
        partials.unshift('.');
    };

    return partials.join('/');
};


exports.findEntryFileRelativePath = findEntryFileRelativePath;
exports.removeProjectDirFromPaths = removeProjectDirFromPaths;
exports.removeProjectDirFromPath = removeProjectDirFromPath;
exports.fixNodeRelativePath = fixNodeRelativePath;
exports.groupPathsByType = GroupPathsByType;
exports.resolvePath = resolvePath;
exports.checkPath = checkPath;