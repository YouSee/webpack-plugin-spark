/* eslint-disable no-console */

import chalk from 'chalk'

export const error = (...args) =>
  console.error(chalk.red('Webpack-plugin-spark:'), ...args)

export default null
