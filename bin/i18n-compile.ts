#!/usr/bin/env node

import process from 'process'
import {mergeLanguageFilesWithDefaultFallbacks} from '../src/compiler.js'

const src = process.argv[2]
const dst = process.argv[3]
if (src && dst) {
  mergeLanguageFilesWithDefaultFallbacks(src, dst)
  console.log('done.')
} else {
  console.error('usage: node i18n-compile <srcDir> <dstDir>')
}
