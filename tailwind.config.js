/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Ethological Palette for Cats
                'cat-blue': '#00BFFF',   // Deep Sky Blue - Max visibility
                'cat-green': '#32CD32',  // Lime Green - Max visibility
                'cat-lime': '#32CD32',   // Alias for consistency
                'cat-yellow': '#FFFF00', // Yellow - High contrast
                'cat-dark': '#000000',   // OLED Black - Background
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Clean typography
            },
        },
    },
    plugins: [],
}
