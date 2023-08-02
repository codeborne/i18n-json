# @codeborne/i18n-json

Simple framework-neutral json-based translations with no dependencies.

```
npm install @codeborne/i18n-json
```

See [sample](sample) on how to structure your translation files.

This format is also supported by [Translate Tool GUI](https://github.com/codeborne/translate-tool).

### Usage

In your project create a `i18n.ts` which will you use for imports:

```ts
import langs from '../i18n/langs.json'
import {init} from '@codeborne/i18n-json'
export * from '@codeborne/i18n-json'

export async function initTranslations() {
  await init({langs})
}
```

Then call `await initTranslations()` in your index.ts to load the selected language file.

To translate a key, call `_('your.translate.key')`
Or with replacements: `_('users.hello', {name: 'World'})`

Pluralized strings are also supported: `_('trees', {count: 1})`, which for English could look like:
`"trees": "You have {count|one:# tree|other:# trees}"` and Russian would be:
`"trees": "У вас есть {count|one:одно дерево|few:# дерева|many:# деревьев}"`.
Plurality keys are provided by browser's `Intl.PluralRules` for the language.

See tests for more examples.

### Frameworks

The library is very small, has zero dependencies and is framework-agnostic. You can use with Svelte, React, Vue or anything else.

If using a SPA framework and want to switch languages on-the-fly (without page reload), you need to add a
small wrapper for the `_` function.

E.g. in Svelte you would use a store to set/retrieve the function and then use it as `$_()`.


### Post compilation step
you can merge translation files in post i18nCompile step that no fallback is needed in runtime.

```bash
npm run i18n-i18n-compile.js {srcDir} {dstDir}
```
