const detectNewline = require('detect-newline')
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')

const quasarAppPath = path.join(__dirname, '../node_modules/@quasar/app/bin/')

const systemNewLine = detectNewline(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'))
const quasarNewline = detectNewline(fs.readFileSync(path.join(quasarAppPath, 'quasar'), 'utf-8'))

if (quasarNewline === '\r\n' && systemNewLine !== quasarNewline) {
  // Quasar has Windows CRLF line endings
  // which prevents from running scripts with yarn (https://github.com/yarnpkg/yarn/issues/5480),
  // but not with npm that automatically converts line endings (https://github.com/npm/npm/issues/17161).

  console.log(`
Replacing CRLF (${JSON.stringify(quasarNewline)}) line endings in Quasar scripts for use with yarn.
https://github.com/yarnpkg/yarn/issues/5480
`)
  shell.find(path.join(quasarAppPath, '*'))
    .map(f => {
      // shell.sed doesn’t work
      shell.exec(`perl -pi -e 's/\r\n|\n|\r/${systemNewLine}/g' ${f}`)
    })
}
