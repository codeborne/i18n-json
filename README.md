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
export * from '@codeborne/i18n-json'

export async function initTranslations() {
  await init({langs})
}
```

Then call `await initTranslations()` in your index.ts to load the selected language file.

To translate a key, call `_('your.translate.key')`
Or with replacements: `_('users.hello', {name: 'World'})`

See tests for more examples.
