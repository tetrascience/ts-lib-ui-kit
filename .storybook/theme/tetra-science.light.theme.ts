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
  colorPrimary: '#2F45B5',      // TetraScience Blue 500
  colorSecondary: '#549DFF',    // Light Blue 300

  // UI Background
  appBg: '#FFFFFF',
  appContentBg: '#FFFFFF',
  appPreviewBg: '#F2F4F7',      // Light Gray
  appBorderColor: '#E5E7EB',
  appBorderRadius: 8,

  // Text
  textColor: '#0B112D',         // Off Black 500
  textInverseColor: '#FFFFFF',

  // Toolbar
  barBg: '#FFFFFF',
  barTextColor: '#0B112D',
  barSelectedColor: '#2F45B5',

  // Form
  inputBg: '#FFFFFF',
  inputBorder: '#E5E7EB',
  inputTextColor: '#0B112D',
  inputBorderRadius: 6,
})