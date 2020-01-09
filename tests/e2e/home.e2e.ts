import { ClientFunction } from 'testcafe'

import HomeModel from './home-page-model'
import SearchModel from './search-page-model'

const Home = new HomeModel()
const Search = new SearchModel()

const getLocation = ClientFunction(() => document.location.href)

fixture `Home`
  .page `http://localhost:8080/`

test('can search from home with text query', async t => {
  await t
    .typeText(Home.searchInput.find('input'), 'bright charming flat')
    .click(Home.searchButton)
    .expect(getLocation()).match(/\/s$/)
    // exact count can make the test flaky but it will warn about significant text search changes
    // due to API server updates. This count value can be updated if needed
    .expect(Search.results.count).eql(2, 'shows relevant search results')
})
