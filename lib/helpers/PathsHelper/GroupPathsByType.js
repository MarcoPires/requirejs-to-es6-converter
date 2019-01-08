
const groupPathsOptionsfallback = ({ fileDependencies: {
    alias = {},
    plugins = {},
    paths = {}
} = {} } = {}) => ({
    fileDependencies: {
        alias: {
            ignore: ['require'].concat(alias.ignore || []),
            replace: alias.replace || {},
            includeImport: alias.includeImport || []
        },
        plugins: {
            ignore: plugins.ignore || [],
            replace: plugins.replace || {},
            includeImport: plugins.includeImport || []
        },
        paths: {
            ignore: paths.ignore || [],
            replace: paths.replace || {},
            includeImport: paths.includeImport || []
        }
    }
});

const addPath = ({ path, variable }, { replace }) => {
    return {
        path,
        variable,
        rootRelative: true,
        ...(replace[path] || {})
    };
};

const addPlugins = (item, { replace }) => {
    const partials = item.path.split('!');
    const plugin = partials[0];
    const path = partials[1];

    return {
        path,
        plugin,
        variable: item.variable,
        rootRelative: true,
        ...(replace[path] || replace[plugin] || replace[item.path] || {})
    };
};

const addAlias = ({ path, variable }, { replace }) => {
    return {
        path,
        variable,
        ...(replace[path] || {})
    };
};

const groupPathsByType = (rawPaths, options) => {
    const { fileDependencies } = groupPathsOptionsfallback(options);
    const { plugins, paths, alias } = fileDependencies;

    return rawPaths.reduce((previousValue, item) => {
        const { path } = item;

        if (path.indexOf('!') > -1 && plugins.ignore.indexOf(path) < 0) {
            previousValue.plugins.push(addPlugins(item, plugins));
            return previousValue;
        };

        if (path.indexOf('/') > -1 && paths.ignore.indexOf(path) < 0) {
            previousValue.paths.push(addPath(item, paths));
            return previousValue;
        };

        if (alias.ignore.indexOf(path) > -1) {
            return previousValue;
        };

        previousValue.alias.push(addAlias(item, alias))
        return previousValue;
    }, { alias: alias.includeImport, plugins: plugins.includeImport, paths: paths.includeImport })
};

module.exports = groupPathsByType;