import { create } from 'storybook/theming/create';

import brandImage from './tetrascience-white-logo.svg';

export const tetrascienceDark = create({
  base: 'dark',

  brandTitle: 'TetraScience UI',
  brandImage,
  
  fontBase: '"Inter", sans-serif',
  fontCode: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  colorPrimary: '#549DFF',
  colorSecondary: '#549DFF',

  appBg: 'oklch(0.1909 0.0567 271.01)',         // Off Black
  appContentBg: '#0B112D',
  appPreviewBg: '#212948',

  textColor: '#FFFFFF',
  textInverseColor: '#0B112D',

  barBg: '#0B112D',
  barTextColor: '#FFFFFF',
  barSelectedColor: '#549DFF',

  inputBg: '#11183D',
  inputBorder: '#2F45B5',
  inputTextColor: '#FFFFFF',
})