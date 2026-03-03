import { addons } from 'storybook/manager-api';

import { tetrascienceDark } from './theme/tetra-science.dark.theme';
import { tetrascienceLight } from './theme/tetra-science.light.theme';

import './theme/index.css';

addons.setConfig({
  theme: tetrascienceLight,
});

// Sync Storybook chrome theme when addon-themes global changes
addons.register('theme-sync', (api) => {
  const channel = addons.getChannel();

  channel.on('globalsUpdated', ({ globals }: { globals: Record<string, string> }) => {
    const theme = globals.theme;
    if (theme === 'dark') {
      api.setOptions({ theme: tetrascienceDark });
    } else {
      api.setOptions({ theme: tetrascienceLight });
    }
  });
});