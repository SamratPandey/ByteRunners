/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'], // Enables dark mode based on the "dark" class
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"], // Define your content paths
	theme: {
	  extend: {
		colors: {
		  background: 'hsl(var(--background, 0 0% 100%))',
		  foreground: 'hsl(var(--foreground, 222.2 84% 4.9%))',
		  card: {
			DEFAULT: 'hsl(var(--card, 0 0% 100%))',
			foreground: 'hsl(var(--card-foreground, 222.2 84% 4.9%))',
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover, 0 0% 100%))',
			foreground: 'hsl(var(--popover-foreground, 222.2 84% 4.9%))',
		  },
		  primary: {
			DEFAULT: 'hsl(var(--primary, 222.2 47.4% 11.2%))',
			foreground: 'hsl(var(--primary-foreground, 210 40% 98%))',
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary, 210 40% 96.1%))',
			foreground: 'hsl(var(--secondary-foreground, 222.2 47.4% 11.2%))',
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted, 210 40% 96.1%))',
			foreground: 'hsl(var(--muted-foreground, 215.4 16.3% 46.9%))',
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent, 210 40% 96.1%))',
			foreground: 'hsl(var(--accent-foreground, 222.2 47.4% 11.2%))',
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive, 0 84.2% 60.2%))',
			foreground: 'hsl(var(--destructive-foreground, 210 40% 98%))',
		  },
		  border: 'hsl(var(--border, 214.3 31.8% 91.4%))',
		  input: 'hsl(var(--input, 214.3 31.8% 91.4%))',
		  ring: 'hsl(var(--ring, 222.2 84% 4.9%))',
		  focusRing: 'hsl(var(--focus-ring, 210 100% 80%))',
		},
		borderRadius: {
		  xl: '1rem', // Add extra border radius
		},
	  },
	},
	plugins: [
	  require("tailwindcss-animate"), // Include any necessary plugins
	],
  };
  