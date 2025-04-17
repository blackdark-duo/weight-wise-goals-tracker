
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
                // Custom theme colors with enhanced palette
                brand: {
                    primary: '#8B5CF6', // Improved purple
                    secondary: '#F97316', // Vibrant orange
                    tertiary: '#06B6D4', // Cyan for accents
                    light: '#F3F4F6', // Light background
                    dark: '#1F2937', // Dark text
                },
                weight: {
                    gain: '#F59E0B', // Amber for weight gain
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
                // Gradient colors
                gradient: {
                    purple: {
                        start: '#C084FC',
                        end: '#8B5CF6',
                    },
                    blue: {
                        start: '#60A5FA',
                        end: '#3B82F6',
                    },
                    green: {
                        start: '#34D399',
                        end: '#10B981',
                    },
                    orange: {
                        start: '#FDBA74',
                        end: '#F97316',
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
            backgroundImage: {
                'gradient-linear-purple': 'linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)',
                'gradient-linear-orange': 'linear-gradient(90deg, hsla(39, 100%, 77%, 1) 0%, hsla(22, 90%, 57%, 1) 100%)',
                'gradient-linear-blue': 'linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)',
                'gradient-linear-green': 'linear-gradient(90deg, hsla(146, 45%, 73%, 1) 0%, hsla(145, 78%, 29%, 1) 100%)',
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
