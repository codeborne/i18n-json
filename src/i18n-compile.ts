import * as process from 'process'
import * as fs from 'fs'
import type {Dict} from './i18n'
import * as path from 'path'

const src = process.argv[2]
const dst = process.argv[3]
if (src && dst) {
  i18nCompile(src, dst).then(() => {
    console.log('done.')
  })
} else {
  console.error('use: npm run i18n-compile.js {srcDir} {dstDir}')
}

async function readJsonFile(filePath: string): Promise<any> {
  return await JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJson(outputPath: string, data: any) {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')
}

export function mergeJson(dictionary: Dict, defaultDictionary: Dict, parent: string = '/'): any {
  for (const key in defaultDictionary) {
    let jsonPointer = path.join(parent, key)
    if (typeof dictionary[key] === 'object' && typeof defaultDictionary[key] === 'object') {
      dictionary[key] = mergeJson(dictionary[key], defaultDictionary[key], jsonPointer)
    } else {
      if (!dictionary[key]) {
        console.warn(`[WARNING] Add missing property ${jsonPointer} to translation`)
        dictionary[key] = defaultDictionary[key]
      }
    }
  }
  return dictionary
}

export async function i18nCompile(sourceDir: string, destinationDir: string) {
  fs.mkdirSync(destinationDir, {recursive: true})
  const languages = await copy(sourceDir, destinationDir, 'langs.json')
  const defaultTranslations = await copy(sourceDir, destinationDir, `${languages[0]}.json`)
  for (let i = 1; i < languages.length; i++) {
    console.warn(`compile ${languages[i]}`)
    await copy(sourceDir, destinationDir, `${languages[i]}.json`, (translations) => {
      return mergeJson(translations, defaultTranslations)
    })
  }
}

async function copy(src: string, dst: string, fileName: string, conversion: ((a: any) => any) = (a) => a) {
  let converted = conversion(await readJsonFile(path.join(src, fileName)))
  writeJson(path.join(dst, fileName), converted)
  return converted
}
