import SearchModel from './search-page-model'

const Search = new SearchModel()

fixture `Search`
  .page `http://localhost:8080/s`

const delay = Search.delay

test ('can use text query, search modes and filters', async t => {
  await t
    .expect(Search.results.count).gt(1, { timeout: 20000 })

  const nbAssets = await Search.results.count

  await t
    .typeText(Search.headerInput.find('input'), 'flat')
    .wait(delay)

  const nbFlats = await Search.results.count

  await t
    .expect(nbFlats).lt(nbAssets)
    .click(Search.modesDropdown)
    .click(Search.modes.withAttribute('data-mode', 'renting'))
    .wait(delay)
    .expect(Search.results.count).eql(nbFlats - 1)
    .click(Search.modesDropdown)
    .click(Search.modes.withAttribute('data-mode', 'default'))
    .wait(delay)
    .expect(Search.results.count).eql(nbFlats)
    .click(Search.headerInputClearIcon)
    .wait(delay)
    .expect(Search.results.count).eql(nbAssets)

  await t
    .click(Search.filtersButton)
    .click(Search.categoriesSelect)
    .click(Search.categories)
    .click(Search.filtersSearchButton)
    .wait(delay)
    .expect(Search.results.count).lt(nbAssets)
    .click(Search.filtersResetButton)
    .wait(delay)
    .expect(Search.results.count).eql(nbAssets)
})
