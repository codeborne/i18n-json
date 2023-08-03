#!/usr/bin/env node

import * as process from 'process'
import * as fs from 'fs'
import type {Dict} from './i18n'
import * as path from 'path'

const src = process.argv[2]
const dst = process.argv[3]
if (src && dst) {
  mergeLanguageFilesWithDefaultFallbacks(src, dst)
  console.log('done.')
} else {
  console.error('usage: node i18n-compile <srcDir> <dstDir>')
}

function readJsonFile(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(outputPath: string, data: any) {
  fs.writeFileSync(outputPath, JSON.stringify(data), 'utf-8')
}

export function mergeLanguageFilesWithDefaultFallbacks(sourceDir: string, destinationDir: string) {
  fs.mkdirSync(destinationDir, {recursive: true})
  const langs = processFile(sourceDir, destinationDir, 'langs.json')
  const fileName = `${langs[0]}.json`
  const defaultDict = processFile(sourceDir, destinationDir, fileName)
  for (let i = 1; i < langs.length; i++) {
    console.log(`compiling ` + fileName)
    processFile(sourceDir, destinationDir, `${langs[i]}.json`, dict => mergeDicts(dict, defaultDict))
  }
}

export function mergeDicts(dict: Dict, defaultDict: Dict, parent = ''): any {
  let numFallbacks = 0
  for (const key in defaultDict) {
    const fullKey = parent + '.' + key
    if (typeof dict[key] === 'object' && typeof defaultDict[key] === 'object')
      dict[key] = mergeDicts(dict[key], defaultDict[key], fullKey)
    else if (!dict[key]) {
      dict[key] = defaultDict[key]
      numFallbacks++
    }
  }
  if (numFallbacks) console.warn(`  added ${numFallbacks} fallbacks`)
  return dict
}

function processFile(src: string, dst: string, fileName: string, conversion: ((a: any) => any) = (a) => a) {
  let converted = conversion(readJsonFile(path.join(src, fileName)))
  writeJson(path.join(dst, fileName), converted)
  return converted
}
