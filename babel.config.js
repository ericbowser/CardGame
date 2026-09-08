module.exports = (api) => {
    // This caches the Babel config by environment.
    api.cache.using(() => process.env.NODE_ENV);
    const presets = [];
    const plugins = [];

    if (api.env('test')) {
        presets.push('@babel/preset-env');
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
