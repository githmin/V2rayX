// // tailwind.config.js
// const { nextui } = require("@nextui-org/react");

// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./stats.html",
//     "./dist/index.html",
//     "./src/**/*.{js,jsx,ts,tsx}",
//     // make sure it's pointing to the ROOT node_module
//     "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
//     // single component styles
//     // "./node_modules/@nextui-org/theme/dist/components/button.js",
//     // or you can use a glob pattern (multiple component styles)
//     // './node_modules/@nextui-org/theme/dist/components/(button|snippet|code|input).js'
//   ],
//   theme: {
//     extend: {},
//   },
//   darkMode: "class",
//   plugins: [nextui()],
// };
import defaultTheme from 'tailwindcss/defaultTheme';

import { iconsPlugin, getIconCollections } from '@egoist/tailwindcss-icons';
import animatePlugin from 'tailwindcss-animate';
import { customIcons } from './src/app/designs/icons/custom-icons';

import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

const config: Config = {
  content: [
    './index.html',
    './dist/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      ...defaultTheme,
      spacing: defaultTheme.spacing,
      colors: {
        regular: {
          primary: '#148EFF',
          secondary: '#8694A8',
        },
        table: {},
      },
      borderRadius: {
        md: '0.25rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui(),
    iconsPlugin({
      extraProperties: {
        verticalAlign: 'middle',
      },
      collections: {
        ...getIconCollections(['feather', 'mdi']),
        custom: {
          icons: customIcons,
          height: 24,
          width: 24,
        },
      },
    }),
    animatePlugin,
  ],
};

export default config;
