
const groupPathsOptionsfallback = ({ fileDependencies: {
    alias = {},
    plugins = {},
    paths = {}
} = {} } = {}) => ({
    fileDependencies: {
        alias: {
            ignore: ['require'].concat(alias.ignore || []),
            replace: alias.replace || {}
        },
        plugins: {
            ignore: plugins.ignore || [],
            replace: plugins.replace || {}
        },
        paths: {
            ignore: paths.ignore || [],
            replace: paths.replace || {}
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

const groupPathsByType = (paths, options) => {
    const { fileDependencies } = groupPathsOptionsfallback(options);

    return paths.reduce((previousValue, item) => {
        const { path } = item;

        if (path.indexOf('!') > -1 && fileDependencies.plugins.ignore.indexOf(path) < 0) {
            previousValue.plugins.push(addPlugins(item, fileDependencies.plugins))
            return previousValue;
        };

        if (path.indexOf('/') > -1 && fileDependencies.paths.ignore.indexOf(path) < 0) {
            previousValue.paths.push(addPath(item, fileDependencies.paths))
            return previousValue;
        };

        if (fileDependencies.alias.ignore.indexOf(path) > -1) {
            return previousValue;
        };

        previousValue.alias.push(addAlias(item, fileDependencies.alias))
        return previousValue;
    }, { alias: [], plugins: [], paths: [] })
};

module.exports = groupPathsByType;