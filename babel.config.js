module.exports = (api) => {
    // This caches the Babel config by environment.
    api.cache.using(() => process.env.NODE_ENV);
    const presets = [];
    const plugins = [];

    if (api.env('test')) {
        // Presets and plugins specific to Jest testing environment
        presets.push('@babel/preset-env');
        plugins.push('@babel/plugin-transform-runtime'); // or any plugin you need for Jest
    } else {
        // Presets and plugins for other environments (e.g., development, production)
        presets.push('@babel/preset-env', '@babel/preset-react'); // assuming you are working with React
        // Add any other presets or plugins required for your application
    }
    console.log('babel config')
    return {
        presets,
        plugins,
    };
};

module.exports = {
    "jest": {
        "transform": {
            "^.+\\.jsx?$": "babel-jest"
        }
    }
}
