const DISPLAY_TO_SYMBOL = {
  'RELIANCE':    'RELIANCE',
  'TCS':         'TCS',
  'INFY':        'INFY',
  'HDFC BANK':   'HDFCBANK',
  'ICICI BANK':  'ICICIBANK',
  'AXIS BANK':   'AXISBANK',
  'SBI':         'SBIN',
  'WIPRO':       'WIPRO',
  'BHARTIARTL':  'BHARTIARTL',
  'HINDUNILVR':  'HINDUNILVR',
  'ITC':         'ITC',
  'KOTAKBANK':   'KOTAKBANK',
  'LT':          'LT',
  'MARUTI':      'MARUTI',
  'BAJFINANCE':  'BAJFINANCE'
}

const SYMBOL_TO_DISPLAY = Object.fromEntries(
  Object.entries(DISPLAY_TO_SYMBOL).map(([k, v]) => [v, k])
)

module.exports = { DISPLAY_TO_SYMBOL, SYMBOL_TO_DISPLAY }
