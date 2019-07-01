# Coding Style

This document sounds very opinionated and was written for/by Stelace devs.

We’re just sharing it here as it could help.

This template includes automatic JS linting before commit using [husky](https://github.com/typicode/husky).

## General guidelines

Sorry for the acronyms:
- [KISS](https://en.wikipedia.org/wiki/KISS_principle)
- [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- and if you’re brave, [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it), because eXtreme Programming is nice.

### Naming conventions

Use [descriptive](https://signalvnoise.com/posts/3250-clarity-over-brevity-in-variable-and-method-names) names.

Consider the following example, replacing a [magic number](http://wiki.c2.com/?MagicNumber) with a variable:

```js
// Some logic…

// Some long comment to explain why 30 is a relevant value…
if (dateDiff >= 30) {
  doSomethingWithMessages()
}

//  |  vs
//  V

const maxDelayBetweenGroupedMessages = 30

// Some logic…

if (dateDiff >= maxDelayBetweenGroupedMessages) {
  doSomethingWithMessages() // much easier to guess what this does, even with a silly name
}
```

Yes, keep these names short when you can:

- e.g. use `i` rather than `index` in a loop,
- And more importantly pick you words [carefully](https://research.swtch.com/names).

### Use the right tool for the job

Sometimes you may need to ask yourself (or better, ask your [observer](https://en.wikipedia.org/wiki/Pair_programming)) if you really can’t make your code _sound_ better.

Look at this real refactoring example (not telling you who coded what):

```js
const gettersPrefix = 'getters'
const gettersPrefixRegex = new RexExp(`^getters\\.(.*)`)

// Quite difficult to understand what this does at first glance
return isActiveFor.reduce((memo, forRole) => {
  if (forRole.startsWith(gettersPrefix)) {
    const accessLabel = forRole.slice(gettersPrefix.length)
    return memo || rootGetters[accessLabel]
  } else {
    return memo || currentUserRoles.includes(forRole)
  }
}, false)

//  |
//  V

// Shorter, clearer version, that reads as English, using Array.some and RegExp
return isActiveFor.some(role => {
  const getter = gettersPrefixRegex.test(role) && role.replace(gettersPrefixRegex, '$1')
  return getter ? rootGetters[getter] : currentUserRoles.includes(role)
})
```

### Go functional

Look at how built-in methods, lodash functions, or your own helpers can make your code easier to read by removing boilerplate code:

```js
if (Array.isArray(filters.categoryId)) {
  searchParams.categoriesIds = filters.categoryId
} else {
  searchParams.categoriesIds = [filters.categoryId]
}

//  |
//  V

// Better use Lodash flatten (or Array.flat with babel / Node 11) method to deal with both cases
searchParams.categoriesIds = flatten([filters.categoryId])
```

```js
if (location && typeof location.longitude === 'number' && typeof location.latitude === 'number') {
  searchParams.location = location
}

//  |
//  V

// Reworked version below is not only shorter, but safer too since it excludes NaN and Infinity
if (location && [location.longitude, location.latitude].every(Number.isFinite)) {
  searchParams.location = location
}
```

## Vue Style guidelines

We follow [Vue Style Guide](https://vuejs.org/v2/style-guide/) for consistency.

If in doubt when authoring components, please refer to this guide, with special attention paid to priority A and B rules.

ESLint automatically warns about most priority A, B and C rules during development but some rules can’t be checked by a linter.

### Note about lodash

We use lodash everywhere but just load what we need with lodash babel plugin.

Remember that using lodash in Vue components can have its surprises:

```js
import { get } from 'lodash'

export default {
  // …
  computed: {
    // Don’t do this
    rating () { // this.rating won’t react to `this.target` changes since it is within lodash scope.
      return get(this.target, 'averageRating')
    }
    // But this:
    // Explicitly use this.target within Vue component and get reactivity back
    rating () {
      const t = this.target
      return get(t, 'averageRating')
    }
  }
}
```

## Lesser matter

### Long lines, white spaces

No strict rule here but we try to keep lines shorter than 100, 120 when we really need this one-liner. It helps keeping code readable.

You can include this in your VSCode `settings.json`, with some extras to spot extraneous white spaces:

```js
  "editor.rulers": [100, 120],
  "editor.renderWhitespace": "boundary",
  "editor.wordWrap": "on",
```

Try to always keep your commit messages’ headers below 70 characters to keep them readable on Github. Again VSC helps with that.

### Tools

We use [Standard](https://standardjs.com/rules.html) ESLint rules to enforce style conventions. Please refer to `.eslintrc.js` if needed.

`.editorconfig` file is included in the project to apply basic style and formatting conventions.
