#!/usr/bin/env node

import * as process from 'process'
import * as fs from 'fs'
import {mergeDicts} from './i18n'
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
  console.log('Langs: ', langs)
  let noTranslate: Set<string> = new Set()
  try {
    noTranslate = new Set(readJsonFile(path.join(sourceDir, 'dont-translate-keys.json')))
    console.log('dont-translate-keys: ', noTranslate)
  } catch (e) {}
  const defaultDict = processFile(sourceDir, destinationDir, `${langs[0]}.json`)
  for (let i = 1; i < langs.length; i++) {
    const fileName = langs[i] + '.json'
    console.log(`compiling ` + fileName)
    processFile(sourceDir, destinationDir, fileName, dict => mergeDicts(dict, defaultDict, noTranslate))
  }
}

function processFile(src: string, dst: string, fileName: string, conversion: ((a: any) => any) = (a) => a) {
  let converted = conversion(readJsonFile(path.join(src, fileName)))
  writeJson(path.join(dst, fileName), converted)
  return converted
}
