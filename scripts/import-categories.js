const csv = require('csvtojson')

/**
 * Example of categories CSV file
 *
 * label | lvl1 | lvl2 | lvl3
 * --------------------------
 * 1     | catA | catB | catC
 * test  |      | catD |           (the catA is reused from the cell above)
 *       | catA |      | catE      (the catA from this row won't be created again, same value as above)
 *
 * Five categories will be created 'catA', 'catB', 'catC', 'catD', 'catE'.
 *
 * Here's the parent-child relationship:
 * catA is the parent of catB.
 * catB is the parent of catC.
 * catA is the parent of catD.
 * catD is the parent of catE.
 *
 * In the file `data.js`, the categories can be referenced by the following identifiers in linked objects (e.g. assets):
 * catA by 'categories::1.1'
 * catB by 'categories::1.2'
 * catC by 'categories::1.3'
 * catD by 'categories::test.2'
 * catE cannot be referenced because there is no label value
 */

async function importCategories (filepath) {
  const rows = await csv({
    delimiter: ','
  }).fromFile(filepath)

  const matrix = []
  const categoriesToCreate = []

  const getAboveCell = (i, j) => {
    if (i === 0) return null
    return matrix[i - 1][j]
  }

  const getParentId = (i, j) => {
    if (j === 0) return null
    return matrix[i][j - 1] ? matrix[i][j - 1]._reference : null
  }

  rows.forEach((row, i) => {
    const matrixRow = []
    matrix.push(matrixRow)

    const label = row.label
    const categories = getCategories(row)

    categories.forEach((category, j) => {
      const { name } = category

      const isFirstRow = i === 0
      const isFirstColumn = j === 0

      // If a cell has no category name,
      // take the name of the above cell
      if (isBlankValue(name)) {
        if (isFirstRow) matrixRow.push(null)
        else matrixRow.push(getAboveCell(i, j))
      } else {
        const aboveCell = getAboveCell(i, j)
        const shouldCopyAboveCell = aboveCell && aboveCell.name === name

        if (shouldCopyAboveCell) {
          matrixRow.push(aboveCell)
        } else {
          // A category that isn't in level 1 must have a parent.
          const parentId = getParentId(i, j)
          if (!isFirstColumn && !parentId) {
            throw new Error(`The category "${name}" has no parent category`)
          }

          const categoryToCreate = {
            name,
            _reference: getReference(i, j),
            _label: getLabel(label, j),
            _parentId: parentId
          }

          matrixRow.push(categoryToCreate)
          categoriesToCreate.push(categoryToCreate)
        }
      }
    })
  })

  return categoriesToCreate
}

function getCategories (row) {
  const maxLvl = 1000
  const categories = []

  if (row[getLvlKey(maxLvl + 1)]) {
    throw new Error(`Lvl cannot exceed ${maxLvl}`)
  }

  for (let lvl = 1; lvl <= maxLvl; lvl++) {
    const key = getLvlKey(lvl)
    const name = row[key]
    if (typeof name === 'undefined') break
    categories.push({ name })
  }

  return categories
}

function getLvlKey (lvl) {
  return `lvl${lvl}`
}

function getReference (i, j) {
  return `${i + 1}.${j + 1}`
}

function getLabel (label, j) {
  if (!label) return null
  return `${label}.${j + 1}`
}

function isBlankValue (str) {
  return !str || /^\s*$/.test(str)
}

module.exports = {
  importCategories
}
