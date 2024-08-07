export const palette = {
  primary: {
    light: '#c462fc',
    main: '#B32EFF',
    dark: '#7213a8',
    contrastText: 'white',
  },
  background: {
    default: '#272332',
    paper: '#272332',
    contrast: '#1F1E23',
  },
  action: {
    active: '#B32EFF',
    hover: '#af64c5',
    selected: '#B32EFF',
    disabled: '#66607738',
  },
  secondary: {
    main: '#968FA8',
    light: '#968FA87f',
  },
  success: {
    main: '#00a72f',
    light: '#00a72f33',
  },
  error: {
    main: '#c50602',
    light: '#c506021e',
  },
  info: {
    main: '#2172e5',
    light: '#2172e51e',
  },
  text: {
    primary: '#E3DDF1',
    secondary: '#968FA8',
    disabled: '#968FA87f',
  },
}

export const boxShadows = {
  input: {
    normal: `
      inset -8px -8px 60px -5px rgba(21, 20, 29, 0.6),
      inset 4px -4px 3px rgba(102, 96, 119, 0.5),
      inset -7px 7px 5px -4px #161222`,
    bold: `
      inset -16px -16px 60px -5px rgba(21, 20, 29, 0.6),
      inset 8px -8px 6px rgba(102, 96, 119, 0.5),
      inset -14px 14px 10px -8px #161222`,
  },
  inner: `
    inset -8px -8px 60px -5px rgba(21, 20, 29, 0.6),
    inset 4px -4px 3px rgba(102, 96, 119, 0.5),
    inset -7px 7px 5px -4px #161222`,
  card: `
    8px 8px 30px rgba(174, 174, 192, 0.35)`,
  button: {
    default: `
      10px -10px 30px rgba(79, 74, 94, 0.3),
      -10px 10px 30px rgba(11, 9, 30, 0.48),
      inset -8px 4px 10px rgba(11, 9, 30, 0.1)`,
    disabled: `
    -10px 10px 30px rgba(11, 9, 30, 0.48),
    inset -8px 4px 10px rgba(11, 9, 30, 0.1)`,
    highlighted: `
      10px -10px 30px rgba(79, 74, 94, 0.3),
      -10px 10px 30px rgba(11, 9, 30, 0.48),
      inset -8px 4px 10px rgba(11, 9, 30, 0.1)`,
  },
  select: `
    -6px 6px 12px rgba(11, 9, 30, 0.5),
    5px -5px 12px rgba(79, 74, 94, 0.3),
    inset -6px 6px 12px rgba(11, 9, 30, 0.24),
    inset -5px -5px 20px rgba(102, 96, 119, 0.2)`,
}

export const overridesDark = {
  MuiButton: {
    styleOverrides: {
      root: {
        margin: 'inherit',
        backgroundColor: '#272332',
        boxShadow: boxShadows.button.default,
        color: palette.primary.main,
        // fontSize: '2.2rem',
        borderRadius: '3rem',
        minWidth: '17.5rem',
        padding: '0.8rem 4.2rem',
        '&:disabled': {
          background: '#272332',
          boxShadow: boxShadows.button.disabled,
          color: palette.text.disabled,
        },
      },
      text: {
        boxShadow: 'none !important'
      }
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        padding: '2.8rem',
        borderRadius: '3.0rem',
        transition: 'none'
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: '0',
      }
    }
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        '&$selected': {
          backgroundColor: '#b32eff19',
          color: palette.text.primary,
          '&:hover': {
            backgroundColor: '#b32eff1e',
          },
        },
      },
      button: {
        '&:hover': {
          backgroundColor: palette.action.hover,
        },
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontWeight: 700,
        fontSize: '1.8rem',
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        fontWeight: '700',
        // fontSize: '2.7rem',
        textOverflow: 'clip',
        borderRadius: '1.5rem',
        padding: '0 !important',
        '&.Mui-disabled': {
          opacity: 1,
          WebkitTextFillColor: 'inherit'
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: '#272332',
      },
    },
  },
  MuiPopover: {
    styleOverrides: {
      paper: {
        borderRadius: '3.0rem',
        boxShadow: `
            0px 5px 15px -3px rgba(0,0,0,0.1),
            0px 8px 20px 1px rgba(0,0,0,0.07),
            0px 3px 24px 2px rgba(0,0,0,0.06);
          `,
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        backgroundColor: '#66607738',
        // boxShadow: boxShadows.select,
        padding: '0px 2.8rem 0px 0px',
        fontSize: '1.8rem',
        minWidth: '0',
        // minWidth: '13.5rem',
        fontWeight: '700',
        lineHeight: '3.6rem',
        borderRadius: '2.3rem'
      },
      select: {
        minWidth: '0',
        paddingRight: '2.8rem',
      },
    },
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        height: 3,
      },
      thumb: {
        height: 14,
        width: 14,
      },
      track: {
        height: 3,
        borderRadius: 8,
      },
      rail: {
        height: 3,
        borderRadius: 8,
      },
      mark: {
        height: 3,
      },
      valueLabel: {
        fontSize: '1.4rem',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        display: 'none',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        color: palette.text.secondary,
        minWidth: 0,
        borderRadius: '3rem',
        '&.Mui-selected': {
          color: palette.primary.main,
        },
        '&:hover:not(.Mui-selected)': {
          color: palette.text.primary,
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: '1.6rem',
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: {
        color: '#E3DDF1',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {},
      standardSuccess: {
        backgroundColor: '#2e7d3212',
        color: '#a5d6a7',
        border: '1px solid #a5d6a738',
      },
      standardError: {
        backgroundColor: '#c628281c',
        color: '#ffcccb',
        border: '1px solid #ffcccb30',
      },
      standardWarning: {
        backgroundColor: '#ff980012',
        color: '#fff59d',
        border: '1px solid #fff59d1a',
      },
      standardInfo: {
        backgroundColor: '#1976d20d',
        color: '#bbdefb',
        border: '1px solid #bbdefb0d',
      },
    },
  },
  MuiIcon: {
    styleOverrides: {
      root: {
        width: '100%',
        height: '100%',
        display: 'flex'
      }
    }
  }
}
