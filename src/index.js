import EventEmitter from 'events'

import Express from 'express'

import { ProgressPlugin } from 'webpack'

import Validate from './validate'
import { error } from './log'
import StartServer from './server'

const defaults = {
  liveReload: false,
  progress: true,
  static: null,
  port: 55555,
  wsPort: 33333,
}

const key = 'webpack-plugin-spark'

let instance = null

class WebpackPluginSpark extends EventEmitter {
  constructor(opts = {}) {
    super()

    const validOptions = Validate(opts)

    if (validOptions.error) {
      error('An invalid option was passed')
      throw validOptions.error
    }

    const options = Object.assign({}, defaults, opts)

    this.app = Express()
    this.state = {}
    this.options = options
    instance = this
  }

  apply(compiler) {
    this.compiler = compiler

    // only allow once instance of the plugin to run for a build
    if (instance !== this) {
      return
    }

    this.hook(compiler)
  }

  attach() {
    const self = this
    const result = {
      apply(compiler) {
        return self.hook(compiler)
      },
    }
    return result
  }

  hook(compiler) {
    const { done, invalid, failed, watchClose, watchRun } = compiler.hooks

    // Done - Executed when the compilation has completed.
    done.tap(key, stats => this.emit('done', stats, compiler))

    // Invalid -Executed when a watching compilation has been invalidated.
    invalid.tap(key, filePath => this.emit('invalid', filePath, compiler))

    // Failed - Called if the compilation fails.
    failed.tap(key, err => this.emit('failed', err, compiler))

    // WatchClose - Called when a watching compilation has stopped.
    watchClose.tap(key, () => this.emit('close', compiler))

    compiler.hooks.compilation.tap(key, compilation => {
      compilation.hooks.afterHash.tap(key, () => {
        // webpack still has a 4 year old bug whereby in watch mode, file timestamps aren't properly
        // accounted for, which will trigger multiple builds of the same hash.
        // see: https://github.com/egoist/time-fix-plugin
        if (this.lastHash === compilation.hash) {
          return
        }
        this.lastHash = compilation.hash
        this.emit('build', compiler.name, compiler)
      })
    })

    // WatchRun - Executes a plugin during watch mode after a new compilation is triggered but before the compilation is actually started.
    watchRun.tapPromise(key, async () => {
      if (!this.state.starting) {
        // ensure we're only trying to start the server once
        this.state.starting = StartServer.bind(this)()
      }

      // wait for the server to startup so we can get our client connection info from it
      await this.state.starting

      if (this.options.progress) {
        const progressPlugin = new ProgressPlugin((percent, message, misc) => {
          // pass the data onto the client raw. connected sockets may want to interpret the data
          // differently
          this.emit('progress', { percent, message, misc }, compiler)
        })

        progressPlugin.apply(compiler)
      }
    })
  }
}

export default WebpackPluginSpark
