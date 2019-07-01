import logger from 'src/utils/logger'

const currencies = listCurrencies()

export function getCurrencyFraction (code) {
  try {
    return currencies[code.toUpperCase()].fraction
  } catch (err) {
    logger(`No currency ${code} found.`) // Don’t break the app, let’s fake the currency
    return 0
  }
}

function listCurrencies () {
  return {
    AFN: {
      fraction: 2
    },
    EUR: {
      fraction: 2
    },
    ALL: {
      fraction: 2
    },
    DZD: {
      fraction: 2
    },
    USD: {
      fraction: 2
    },
    AOA: {
      fraction: 2
    },
    XCD: {
      fraction: 2
    },
    ARS: {
      fraction: 2
    },
    AMD: {
      fraction: 2
    },
    AWG: {
      fraction: 2
    },
    AUD: {
      fraction: 2
    },
    AZN: {
      fraction: 2
    },
    BSD: {
      fraction: 2
    },
    BHD: {
      fraction: 3
    },
    BDT: {
      fraction: 2
    },
    BBD: {
      fraction: 2
    },
    BYR: {
      fraction: 0
    },
    BZD: {
      fraction: 2
    },
    XOF: {
      fraction: 0
    },
    BMD: {
      fraction: 2
    },
    BTN: {
      fraction: 2
    },
    INR: {
      fraction: 2
    },
    BOB: {
      fraction: 2
    },
    BOV: {
      fraction: 2
    },
    BAM: {
      fraction: 2
    },
    BWP: {
      fraction: 2
    },
    NOK: {
      fraction: 2
    },
    BRL: {
      fraction: 2
    },
    BND: {
      fraction: 2
    },
    BGN: {
      fraction: 2
    },
    BIF: {
      fraction: 0
    },
    KHR: {
      fraction: 2
    },
    XAF: {
      fraction: 0
    },
    CAD: {
      fraction: 2
    },
    CVE: {
      fraction: 2
    },
    KYD: {
      fraction: 2
    },
    CLF: {
      fraction: 4
    },
    CLP: {
      fraction: 0
    },
    CNY: {
      fraction: 2
    },
    COP: {
      fraction: 2
    },
    COU: {
      fraction: 2
    },
    KMF: {
      fraction: 0
    },
    CDF: {
      fraction: 2
    },
    NZD: {
      fraction: 2
    },
    CRC: {
      fraction: 2
    },
    HRK: {
      fraction: 2
    },
    CUC: {
      fraction: 2
    },
    CUP: {
      fraction: 2
    },
    ANG: {
      fraction: 2
    },
    CZK: {
      fraction: 2
    },
    DKK: {
      fraction: 2
    },
    DJF: {
      fraction: 0
    },
    DOP: {
      fraction: 2
    },
    EGP: {
      fraction: 2
    },
    SVC: {
      fraction: 2
    },
    ERN: {
      fraction: 2
    },
    ETB: {
      fraction: 2
    },
    FKP: {
      fraction: 2
    },
    FJD: {
      fraction: 2
    },
    XPF: {
      fraction: 0
    },
    GMD: {
      fraction: 2
    },
    GEL: {
      fraction: 2
    },
    GHS: {
      fraction: 2
    },
    GIP: {
      fraction: 2
    },
    GTQ: {
      fraction: 2
    },
    GBP: {
      fraction: 2
    },
    GNF: {
      fraction: 0
    },
    GYD: {
      fraction: 2
    },
    HTG: {
      fraction: 2
    },
    HNL: {
      fraction: 2
    },
    HKD: {
      fraction: 2
    },
    HUF: {
      fraction: 2
    },
    ISK: {
      fraction: 0
    },
    IDR: {
      fraction: 2
    },
    XDR: {
      fraction: 0
    },
    IRR: {
      fraction: 2
    },
    IQD: {
      fraction: 3
    },
    ILS: {
      fraction: 2
    },
    JMD: {
      fraction: 2
    },
    JPY: {
      fraction: 0
    },
    JOD: {
      fraction: 3
    },
    KZT: {
      fraction: 2
    },
    KES: {
      fraction: 2
    },
    KPW: {
      fraction: 2
    },
    KRW: {
      fraction: 0
    },
    KWD: {
      fraction: 3
    },
    KGS: {
      fraction: 2
    },
    LAK: {
      fraction: 2
    },
    LBP: {
      fraction: 2
    },
    LSL: {
      fraction: 2
    },
    ZAR: {
      fraction: 2
    },
    LRD: {
      fraction: 2
    },
    LYD: {
      fraction: 3
    },
    CHF: {
      fraction: 2
    },
    LTL: {
      fraction: 2
    },
    MOP: {
      fraction: 2
    },
    MKD: {
      fraction: 2
    },
    MGA: {
      fraction: 2
    },
    MWK: {
      fraction: 2
    },
    MYR: {
      fraction: 2
    },
    MVR: {
      fraction: 2
    },
    MRO: {
      fraction: 2
    },
    MUR: {
      fraction: 2
    },
    XUA: {
      fraction: 0
    },
    MXN: {
      fraction: 2
    },
    MXV: {
      fraction: 2
    },
    MDL: {
      fraction: 2
    },
    MNT: {
      fraction: 2
    },
    MAD: {
      fraction: 2
    },
    MZN: {
      fraction: 2
    },
    MMK: {
      fraction: 2
    },
    NAD: {
      fraction: 2
    },
    NPR: {
      fraction: 2
    },
    NIO: {
      fraction: 2
    },
    NGN: {
      fraction: 2
    },
    OMR: {
      fraction: 3
    },
    PKR: {
      fraction: 2
    },
    PAB: {
      fraction: 2
    },
    PGK: {
      fraction: 2
    },
    PYG: {
      fraction: 0
    },
    PEN: {
      fraction: 2
    },
    PHP: {
      fraction: 2
    },
    PLN: {
      fraction: 2
    },
    QAR: {
      fraction: 2
    },
    RON: {
      fraction: 2
    },
    RUB: {
      fraction: 2
    },
    RWF: {
      fraction: 0
    },
    SHP: {
      fraction: 2
    },
    WST: {
      fraction: 2
    },
    STD: {
      fraction: 2
    },
    SAR: {
      fraction: 2
    },
    RSD: {
      fraction: 2
    },
    SCR: {
      fraction: 2
    },
    SLL: {
      fraction: 2
    },
    SGD: {
      fraction: 2
    },
    XSU: {
      fraction: 0
    },
    SBD: {
      fraction: 2
    },
    SOS: {
      fraction: 2
    },
    SSP: {
      fraction: 2
    },
    LKR: {
      fraction: 2
    },
    SDG: {
      fraction: 2
    },
    SRD: {
      fraction: 2
    },
    SZL: {
      fraction: 2
    },
    SEK: {
      fraction: 2
    },
    CHE: {
      fraction: 2
    },
    CHW: {
      fraction: 2
    },
    SYP: {
      fraction: 2
    },
    TWD: {
      fraction: 2
    },
    TJS: {
      fraction: 2
    },
    TZS: {
      fraction: 2
    },
    THB: {
      fraction: 2
    },
    TOP: {
      fraction: 2
    },
    TTD: {
      fraction: 2
    },
    TND: {
      fraction: 3
    },
    TRY: {
      fraction: 2
    },
    TMT: {
      fraction: 2
    },
    UGX: {
      fraction: 0
    },
    UAH: {
      fraction: 2
    },
    AED: {
      fraction: 2
    },
    USN: {
      fraction: 2
    },
    UYI: {
      fraction: 0
    },
    UYU: {
      fraction: 2
    },
    UZS: {
      fraction: 2
    },
    VUV: {
      fraction: 0
    },
    VEF: {
      fraction: 2
    },
    VND: {
      fraction: 0
    },
    YER: {
      fraction: 2
    },
    ZMW: {
      fraction: 2
    },
    ZWL: {
      fraction: 2
    }
  }
}
