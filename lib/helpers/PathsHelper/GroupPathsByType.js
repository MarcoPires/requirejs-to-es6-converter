
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

const removeDuplicatedPaths = items => {
    const paths = items.map(({ path }) => path);
    return items.filter(({ path }, index) => paths.indexOf(path) >= index);
};

const groupPathsByType = (rawPaths, options) => {
    const { fileDependencies } = groupPathsOptionsfallback(options);
    const { plugins, paths, alias } = fileDependencies;

    const groupedPaths = rawPaths.reduce((previousValue, item) => {
        const { path } = item;

        if (path.indexOf('!') > -1) {
           
            if (plugins.ignore.indexOf(path) < 0) {
                previousValue.plugins.push(addPlugins(item, plugins));
            };

            return previousValue;
        };
        

        if (path.indexOf('/') > -1) {

            if (paths.ignore.indexOf(path) < 0) {
                previousValue.paths.push(addPath(item, paths));
            };
            
            return previousValue;
        };

        if (alias.ignore.indexOf(path) < 0) {
            previousValue.alias.push(addAlias(item, alias));
            return previousValue;
        };

        return previousValue;
    }, {
        alias: [].concat(alias.includeImport),
        plugins: [].concat(plugins.includeImport),
        paths: [].concat(paths.includeImport)
    });


    return {
        alias: removeDuplicatedPaths(groupedPaths.alias),
        plugins: removeDuplicatedPaths(groupedPaths.plugins),
        paths: removeDuplicatedPaths(groupedPaths.paths)
    };
};

module.exports = groupPathsByType;