module.exports = {
    theme: {
        extend: {
            colors: {
                // Custom palette names — do not override Tailwind's red/yellow scales (needed for count colors).
                felt: "#111",
                darkgray: "#251313",
                brandLime: "#59EF0B",
            },
            backgroundImage: theme => ({
                'felt-table': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            }),
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)',
                'card-lg': '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)',
            }
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