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
  colorPrimary: '#4285F4',       // --primary
  colorSecondary: '#4285F4',     // --primary

  // UI Background
  appBg: '#FFFFFF',              // --card
  appContentBg: '#FFFFFF',       // --card
  appPreviewBg: '#EEF1F6',      // --surface / --background
  appBorderColor: '#E2E8F0',    // --border / --outline-variant
  appBorderRadius: 8,

  // Text
  textColor: '#0D1B3E',         // --foreground / --on-surface
  textInverseColor: '#FFFFFF',   // --primary-foreground
  textMutedColor: '#64748B',    // --muted-foreground / --outline

  // Toolbar
  barBg: '#FFFFFF',              // --card
  barTextColor: '#0D1B3E',      // --foreground
  barSelectedColor: '#4285F4',  // --primary
  barHoverColor: '#006A73',     // --tertiary

  // Form
  inputBg: '#FFFFFF',            // --card
  inputBorder: '#E2E8F0',       // --border
  inputTextColor: '#0D1B3E',    // --foreground
  inputBorderRadius: 6,

  // Buttons
  buttonBg: '#EEF1F6',          // --surface
  buttonBorder: '#E2E8F0',      // --border

  // Boolean / Toggle
  booleanBg: '#EEF1F6',         // --surface
  booleanSelectedBg: '#EEF2FF', // --secondary
})
