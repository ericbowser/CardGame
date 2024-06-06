module.exports = {
    theme: {
        extend: {
            colors: {
                red: "#111",
                white: "#fff",
                black: "#000",
                darkgray: "#251313",
                yellow: "#59EF0B",
                'custom-color': '#5A67D8',
            },
            backgroundImage: theme => (
                {
                    'radial-green-yellow': 'radial-gradient(circle, #00FF00, #0D2AEE)',
                }
            ),
        },
    },
    dark: 'class',
    content: ["./*.html", "./src/**/*.{js,jsx}"],
    screens: {
        sm: '480px',
        md: '768px',
        lg: '976px',
        xl: '1440px',
    },
    plugins: []
}