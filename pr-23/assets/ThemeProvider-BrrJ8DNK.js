import{j as c}from"./jsx-runtime-CDt2p4po.js";import{r as i}from"./index-GiUgBvb1.js";import{K as m}from"./styled-components.browser.esm-Ctfm6iBV.js";const a={colors:{primary:"var(--blue-900)",primaryHover:"var(--blue-800)",primaryActive:"var(--blue-800)",background:"var(--white-900)",text:"var(--black-900)",border:"var(--grey-200)",cardBackground:"var(--white-900)",cardBorder:"var(--grey-200)"},radius:{small:"4px",medium:"8px",large:"16px"},spacing:{small:"8px",medium:"16px",large:"24px"}},p=({theme:s={},children:n})=>{const e=i.useMemo(()=>({colors:{...a.colors,...s.colors},radius:{...a.radius,...s.radius},spacing:{...a.spacing,...s.spacing}}),[s]);return i.useEffect(()=>{const o=document.documentElement;return e.colors&&Object.entries(e.colors).forEach(([r,t])=>{t&&o.style.setProperty(`--theme-${r}`,t)}),e.radius&&Object.entries(e.radius).forEach(([r,t])=>{t&&o.style.setProperty(`--theme-radius-${r}`,t)}),e.spacing&&Object.entries(e.spacing).forEach(([r,t])=>{t&&o.style.setProperty(`--theme-spacing-${r}`,t)}),()=>{e.colors&&Object.keys(e.colors).forEach(r=>{o.style.removeProperty(`--theme-${r}`)}),e.radius&&Object.keys(e.radius).forEach(r=>{o.style.removeProperty(`--theme-radius-${r}`)}),e.spacing&&Object.keys(e.spacing).forEach(r=>{o.style.removeProperty(`--theme-spacing-${r}`)})}},[e]),c.jsx(m,{theme:e,children:n})};p.__docgenInfo={description:`ThemeProvider component that sets CSS custom properties for theming

This provider merges the provided theme with the default theme and
sets CSS variables on the root element, making them available to both
styled-components and SCSS styles.

@example
\`\`\`tsx
import { ThemeProvider, Button } from '@tetrascience-npm/tetrascience-react-ui';

const customTheme = {
  colors: {
    primary: '#FF0000',
  },
  radius: {
    medium: '12px',
  }
};

<ThemeProvider theme={customTheme}>
  <Button>Click me</Button>
</ThemeProvider>
\`\`\``,methods:[],displayName:"ThemeProvider",props:{theme:{required:!1,tsType:{name:"Theme"},description:"",defaultValue:{value:"{}",computed:!1}},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};export{p as T};
