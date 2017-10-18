Meteor.methods({
  isValidPriceUrl(coin, currency) {
    try {
      console.log('isValidPriceUrl', coin, currency);
      if (coin.trim() === '') return {error: 'No coin filled in'};
      if (currency.trim() === '') return {error: 'No currency filled in'};
      const url = `https://api.coinmarketcap.com/v1/ticker/${coin}/?convert=${currency}`;
      const checkCurrency = `price_${coin.toLowerCase()}`;
      const result = HTTP.call('GET', url);
  
      if (result.error) {
        return {error: 'Invalid coin'}
      }
  
      if (result.length > 0) {
        const exists = !!result[0][checkCurrency];
        if (!exists) return {error: 'Invalid currency'}
      }
    } catch(e) {
      if (e.response.data) {
        return {error: 'Invalid coin'}
      }
    }
    
    return true;
  }
});