import { create } from 'storybook/theming/create';

import brandImage from './tetrascience-white-logo.svg';

export const tetrascienceDark = create({
  base: 'dark',

  brandTitle: 'TetraScience UI',
  brandImage,

  fontBase: '"Inter", sans-serif',
  fontCode: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  // Primary Brand Colors
  colorPrimary: '#94C2FF',       // Primary (dark)
  colorSecondary: '#94C2FF',     // Primary (dark)

  // UI Background
  appBg: '#0B112D',              // Surface
  appContentBg: '#0B112D',       // Surface
  appPreviewBg: '#0B112D',       // Surface
  appBorderColor: '#3E4250',     // Outline Variant
  appBorderRadius: 8,

  // Text
  textColor: '#E2E8EF',          // On Surface
  textInverseColor: '#0B112D',   // Surface
  textMutedColor: '#8A9AB0',     // Neutral 70

  // Toolbar
  barBg: '#1E2440',              // Surface Container
  barTextColor: '#E2E8EF',       // On Surface
  barSelectedColor: '#94C2FF',   // Primary
  barHoverColor: '#B2D3FF',      // Primary 90

  // Form
  inputBg: '#1E2440',            // Surface Container
  inputBorder: '#8890A5',        // Outline
  inputTextColor: '#E2E8EF',     // On Surface
  inputBorderRadius: 6,

  // Buttons
  buttonBg: '#283DA5',           // Primary Container
  buttonBorder: '#8890A5',       // Outline

  // Boolean / Toggle
  booleanBg: '#1E2440',          // Surface Container
  booleanSelectedBg: '#283DA5',  // Primary Container
})
