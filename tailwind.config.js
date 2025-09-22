module.exports = {
    theme: {
        extend: {
            colors: {
                // Original colors (keeping for compatibility)
                red: "#111",
                white: "#fff",
                black: "#000",
                darkgray: "#251313",
                yellow: "#59EF0B",
                'custom-color': '#5A67D8',

                // New mint theme colors
                'mint': {
                    50: '#F0FDFA',   // Very light mint
                    100: '#CCFBF1',  // Light mint
                    200: '#99F6E4',  // Soft mint
                    300: '#5EEAD4',  // Medium mint
                    400: '#2DD4BF',  // Bright mint
                    500: '#14B8A6',  // Main mint
                    600: '#0D9488',  // Deep mint
                    700: '#0F766E',  // Darker mint
                    800: '#115E59',  // Very dark mint
                    900: '#134E4A',  // Darkest mint
                },
                'sage': {
                    50: '#F7F9F7',   // Very light sage
                    100: '#E8F2E8',  // Light sage
                    200: '#D1E7DD',  // Soft sage
                    300: '#A8D8BC',  // Medium sage
                    400: '#7BC393',  // Bright sage
                    500: '#52A56E',  // Main sage
                    600: '#3E8B57',  // Deep sage
                    700: '#2F6B43',  // Darker sage
                    800: '#1F4A2E',  // Very dark sage
                    900: '#0F2A1A',  // Darkest sage
                },
                'cream': {
                    50: '#FEFEFE',   // Pure white
                    100: '#FFFEF7',  // Cream white
                    200: '#FFFBEB',  // Light cream
                    300: '#FEF3C7',  // Soft cream
                    400: '#FDE68A',  // Medium cream
                    500: '#F59E0B',  // Accent cream
                },
            },
            backgroundImage: theme => ({
                'radial-green-yellow': 'radial-gradient(circle, #00FF00, #0D2AEE)', // Keep original
                'mint-gradient': 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 50%, #99F6E4 100%)',
                'sage-gradient': 'linear-gradient(135deg, #F7F9F7 0%, #E8F2E8 50%, #D1E7DD 100%)',
                'mint-radial': 'radial-gradient(ellipse at center, #F0FDFA 0%, #CCFBF1 50%, #5EEAD4 100%)',
            }),
            boxShadow: {
                'mint': '0 4px 6px -1px rgba(20, 184, 166, 0.1), 0 2px 4px -1px rgba(20, 184, 166, 0.06)',
                'mint-lg': '0 10px 15px -3px rgba(20, 184, 166, 0.1), 0 4px 6px -2px rgba(20, 184, 166, 0.05)',
                'sage': '0 4px 6px -1px rgba(82, 165, 110, 0.1), 0 2px 4px -1px rgba(82, 165, 110, 0.06)',
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