import { createTheme } from '@mui/material/styles'

const colors = {
  // Brand / Primary (emerald)
  primary: '#34d399',
  primaryContrastText: '#0d2318',

  // Semantic
  success: '#34d399',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#60a5fa',

  // Surfaces
  background: '#16181d',
  surface: '#1c1f25',

  // Text
  text: '#fafafa',
  textSecondary: '#9aa1ab',
  textDisabled: '#5b636d',

  // Borders — opacity-based whites over the dark surfaces, per design system
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderDefault: 'rgba(255, 255, 255, 0.1)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  overlaySubtle: 'rgba(255, 255, 255, 0.04)',
} as const

const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: colors.primary,
      contrastText: colors.primaryContrastText,
    },

    success: {
      main: colors.success,
    },

    warning: {
      main: colors.warning,
    },

    error: {
      main: colors.error,
    },

    info: {
      main: colors.info,
    },

    background: {
      default: colors.background,
      paper: colors.surface,
    },

    text: {
      primary: colors.text,
      secondary: colors.textSecondary,
      disabled: colors.textDisabled,
    },

    divider: colors.borderDefault,
  },

  spacing: 4,

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',

    h1: {
      fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
      fontSize: '2rem',
      lineHeight: 1.25,
      fontWeight: 800,
    },

    h2: {
      fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
      fontSize: '1.5rem',
      lineHeight: 1.3,
      fontWeight: 700,
    },

    h3: {
      fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
      fontSize: '1.25rem',
      lineHeight: 1.4,
      fontWeight: 700,
    },

    h4: {
      fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
      fontSize: '1.125rem',
      lineHeight: 1.4,
      fontWeight: 700,
    },

    h5: {
      fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
      fontWeight: 600,
    },

    h6: {
      fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
      fontWeight: 600,
    },

    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },

    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },

    button: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
      fontWeight: 600,
      textTransform: 'none',
    },

    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      fontWeight: 400,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background,
          backgroundImage: 'none',
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          transition: 'background-color 0.2s ease-in-out',
        },

        sizeSmall: {
          minHeight: 32,
          padding: '6px 12px',
        },

        sizeMedium: {
          minHeight: 40,
          padding: '10px 16px',
        },

        sizeLarge: {
          minHeight: 48,
          padding: '12px 24px',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          borderRadius: 12,

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.borderStrong,
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: colors.primary,
          },

          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.error,
          },

          '&.Mui-disabled': {
            backgroundColor: colors.overlaySubtle,
          },
        },

        notchedOutline: {
          borderColor: colors.borderDefault,
        },

        input: {
          color: colors.text,

          '&::placeholder': {
            color: colors.textSecondary,
            opacity: 1,
          },

          '&.Mui-disabled': {
            color: colors.textDisabled,
            WebkitTextFillColor: colors.textDisabled,
          },

          '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 100px ${colors.surface} inset`,
            WebkitTextFillColor: colors.text,
            caretColor: colors.text,
            transition: 'background-color 9999s ease-out 0s',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          backgroundImage: 'none',
          border: `1px solid ${colors.borderSubtle}`,
          borderRadius: 18,
          boxShadow: 'none',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.borderSubtle,
        },
      },
    },
  },
})

export default theme
