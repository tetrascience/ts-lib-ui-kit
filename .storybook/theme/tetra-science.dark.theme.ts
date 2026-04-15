import { create } from 'storybook/theming/create';

import brandImage from './tetrascience-white-logo.svg';

export const tetrascienceDark = create({
  base: 'dark',

  brandTitle: 'TetraScience UI',
  brandImage,

  fontBase: '"Inter", sans-serif',
  fontCode: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  // Primary Brand Colors
  colorPrimary: '#B5C4FF',       // --primary
  colorSecondary: '#B5C4FF',     // --primary

  // UI Background
  appBg: '#1C1B21',              // --background
  appContentBg: '#1C1B21',       // --background
  appPreviewBg: '#1C1B21',       // --background
  appBorderColor: '#454650',     // --border / --outline-variant
  appBorderRadius: 8,

  // Text
  textColor: '#E5E1E9',          // --foreground / --on-surface
  textInverseColor: '#102F72',   // --primary-foreground
  textMutedColor: '#90909B',     // --muted-foreground / --outline

  // Toolbar
  barBg: '#26252B',              // --card / --surface-container
  barTextColor: '#E5E1E9',       // --foreground
  barSelectedColor: '#B5C4FF',   // --primary
  barHoverColor: '#4FDAEB',      // --tertiary

  // Form
  inputBg: '#26252B',            // --card / --surface-container
  inputBorder: '#454650',        // --border
  inputTextColor: '#E5E1E9',     // --foreground
  inputBorderRadius: 6,

  // Buttons
  buttonBg: '#264DA0',           // --secondary
  buttonBorder: '#454650',       // --border

  // Boolean / Toggle
  booleanBg: '#26252B',          // --surface-container / --card
  booleanSelectedBg: '#264DA0',  // --secondary
})
