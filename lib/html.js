/* =
MIT License

Copyright (c) 2023 Gürgün Dayıoğlu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const escapeDictionary = {
  '"': '&quot;',
  "'": '&apos;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
}

function buildRegexp () {
  const txt = `[${Object.keys(escapeDictionary).join('')}]`

  try {
    return new RegExp(
      txt,
      'gv'
    )
  } catch {
    // Polyfill for Node.js < 18
    return new RegExp(
      txt,
      'gu'
    )
  }
}

const escapeRegExp = buildRegexp()

const escapeFunction = (key) => escapeDictionary[key]

/**
 * @param {{ raw: string[] }} literals
 * @param {...*} expressions
 * @returns {string}
 */
const html = ({ raw: literals }, ...expressions) => {
  const lastLitI = literals.length - 1
  let acc = ''

  for (let i = 0; i < lastLitI; ++i) {
    let lit = literals[i]
    let exp =
      typeof expressions[i] === 'string'
        ? expressions[i]
        : expressions[i] == null
          ? ''
          : Array.isArray(expressions[i]) === true
            ? expressions[i].join('')
            : `${expressions[i]}`

    if (lit.length !== 0 && lit.charCodeAt(lit.length - 1) === 33) {
      lit = lit.slice(0, -1)
    } else if (exp.length !== 0) {
      exp = exp.replace(escapeRegExp, escapeFunction)
    }

    acc += lit += exp
  }

  acc += literals[lastLitI]

  return acc
}

export {
  escapeDictionary,
  html
}
