import { create } from 'storybook/theming/create';

import brandImage from './tetrascience-logo.svg';

export const tetrascienceLight = create({
  base: 'light',

  brandTitle: 'TetraScience UI',
  brandImage,

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  // Primary Brand Colors
  colorPrimary: '#2F45B5',       // Primary
  colorSecondary: '#2F45B5',     // Primary

  // UI Background
  appBg: '#FFFFFF',
  appContentBg: '#FFFFFF',
  appPreviewBg: '#F2F4F7',       // Surface
  appBorderColor: '#DDE1E8',     // Outline Variant
  appBorderRadius: 8,

  // Text
  textColor: '#0B112D',          // On Surface
  textInverseColor: '#FFFFFF',
  textMutedColor: '#526175',     // Neutral 40

  // Toolbar
  barBg: '#FFFFFF',
  barTextColor: '#0B112D',       // On Surface
  barSelectedColor: '#2F45B5',   // Primary
  barHoverColor: '#4E79A7',      // Tertiary

  // Form
  inputBg: '#FFFFFF',
  inputBorder: '#B9C0CF',        // Outline
  inputTextColor: '#0B112D',     // On Surface
  inputBorderRadius: 6,

  // Buttons
  buttonBg: '#F2F4F7',           // Surface
  buttonBorder: '#B9C0CF',       // Outline

  // Boolean / Toggle
  booleanBg: '#F2F4F7',          // Surface
  booleanSelectedBg: '#B2D3FF',  // Primary Container
})
