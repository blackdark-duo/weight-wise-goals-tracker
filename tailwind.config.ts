
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				lexend: ['Lexend', 'sans-serif'],
				sans: ['Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
                // Custom theme colors for weight tracking app
                brand: {
                    primary: '#9b87f5', // Purple main color
                    secondary: '#7E69AB', // Secondary purple
                    tertiary: '#06B6D4', // Accent blue
                    light: '#F3F4F6', // Light background
                    dark: '#1F2937', // Dark text
                },
                weight: {
                    gain: '#F97316', // Orange for weight gain
                    loss: '#10B981', // Green for weight loss
                    maintain: '#6366F1', // Indigo for maintenance
                },
                goal: {
                    progress: '#10B981', // Green for progress
                    pending: '#F59E0B', // Amber for pending
                    missed: '#EF4444', // Red for missed goals
                },
                ui: {
                    background: '#F8FAFC', // Very light background
                    card: '#FFFFFF',
                    border: '#E2E8F0',
                    hover: '#F1F5F9',
                },
                gradient: {
                    purple: {
                        start: '#9b87f5',
                        end: '#7E69AB',
                    },
                    blue: {
                        start: '#60A5FA',
                        end: '#3B82F6',
                    },
                    green: {
                        start: '#34D399',
                        end: '#10B981',
                    },
                }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
                'fade-in': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'appear': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'appear-zoom': {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.95)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)'
                    }
                }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'appear': 'appear 0.7s ease-out forwards',
                'appear-zoom': 'appear-zoom 0.7s ease-out forwards'
			},
            backgroundImage: {
                'gradient-linear-purple': 'linear-gradient(90deg, #9b87f5 0%, #7E69AB 100%)',
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
