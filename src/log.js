/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */

import chalk from 'chalk'

export const error = (...args) =>
  console.error(chalk.red('Webpack-plugin-spark:'), ...args)
