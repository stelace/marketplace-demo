/*
Foreign exchange rate converter for multi-currency websites
Just a placeholder for now.
To turn into a standalone plugin if appropriate.
*/

const exchangePlugin = {
  install: function (Vue) {
    Vue.prototype.$fx = function (price, { rate = 1 } = {}) {
      // Rate should be stored in a store module and refreshed from a FX API when needed
      return price * rate
    }
  }
}

export default async ({ Vue }) => {
  Vue.use(exchangePlugin)
}
