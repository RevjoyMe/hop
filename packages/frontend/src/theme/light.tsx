export const palette = {
  primary: {
    light: '#c462fc',
    main: '#B32EFF',
    dark: '#7213a8',
    contrastText: 'white',
  },
  background: {
    default: '#FDF7F9',
    paper: '#FDF7F9',
    contrast: '#FFFFFF',
  },
  action: {
    active: '#B32EFF',
    hover: '#e8c1ff',
    selected: '#B32EFF',
    disabled: 'white', },
  secondary: {
    main: '#666077',
    light: '#6660777f',
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
    primary: '#0F0524',
    secondary: '#666077',
    disabled: '#6660777f',
  },
}

export const boxShadows = {
  input: {
    normal: `
      inset -3px -3px 6px rgba(255, 255, 255, 0.5),
      inset 3px 3px 6px rgba(174, 174, 192, 0.16)`,
    bold: `
      inset -12px -12px 24px rgba(255, 255, 255, 0.5),
      inset 12px 12px 24px rgba(174, 174, 192, 0.16)`,
  },
  inner: `
    inset 4px -4px 3px #FFFFFF,
    inset 8px -8px 60px -5px #F1E9EC,
    inset -7px 7px 5px -4px rgba(174, 174, 192, 0.4)`,
  card: `
    8px 8px 30px rgba(174, 174, 192, 0.35),
    inset -8px -8px 12px rgba(255, 255, 255, 0.15),
    inset 8px 8px 8px rgba(174, 174, 192, 0.04)`,
  button: {
    default: `
      10px -10px 30px #FFFFFF,
      -10px 10px 30px #D8D5DC,
      inset -8px 4px 10px rgba(102, 96, 119, 0.04)`,
    disabled: `
      10px -10px 30px #FFFFFF,
      -10px 10px 30px #D8D5DC,
      inset -8px 4px 10px rgba(102, 96, 119, 0.04)`,
    highlighted: `
      10px -10px 30px #FFFFFF,
      -10px 10px 30px rgba(216, 213, 220, 0.8)`,
  },
  select: `
    -6px 6px 12px #D8D5DC,
    5px -5px 12px #FFFFFF,
    inset -6px 6px 12px rgba(233, 229, 232, 0.4),
    inset -5px -5px 14px rgba(255, 255, 255, 0.15)`,
}

export const overridesLight = {
  MuiButton: {
    styleOverrides: {
      root: {
        margin: 'inherit',
        backgroundColor: 'transparent',
        boxShadow: boxShadows.button.default,
        color: palette.primary.main,
        // fontSize: '2.2rem',
        borderRadius: '3rem',
        minWidth: '17.5rem',
        padding: '0.8rem 4.2rem',
        '&:disabled': {
          background: '#FDF7F9',
          boxShadow: boxShadows.button.default,
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
    }
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
        backgroundColor: '#FDF7F9',
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
        backgroundColor: 'white',
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
        paddingLeft: '1.8rem'
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
        color: '#0F0524',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {},
      standardSuccess: {
        backgroundColor: '#e0faf2',
        color: '#0b4d00',
        border: '1px solid #004d1c2b',
      },
      standardError: {
        backgroundColor: '#ffebee',
        color: '#9f1919',
        border: '1px solid #c628283d',
      },
      standardWarning: {
        backgroundColor: '#fff3e0b3',
        color: '#ef7d00',
        border: '1px solid #ef6c002e',
      },
      standardInfo: {
        backgroundColor: '#e3f2fd',
        color: '#0277bd',
        border: '1px solid #0277bd2e',
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
