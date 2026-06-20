import YahooFinanceClass from 'yahoo-finance2';

// 1. Initialize the object ONCE at the top level of the file
const yahooFinance = new YahooFinanceClass({
    suppressNotices: ['yahooSurvey']
});

export const searchAssets = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Missing query parameter" });

    // 1. Get search autocomplete results to discover symbols
    const searchResults = await yahooFinance.search(query, { newsCount: 0 });

    if (!searchResults || !searchResults.quotes || searchResults.quotes.length === 0) {
      return res.json([]);
    }

    // 2. Filter out non-Yahoo symbols and grab up to 5 matching tickers
    const matchingQuotes = searchResults.quotes
      .filter(item => item?.isYahooFinance)
      .slice(0, 5);

    if (matchingQuotes.length === 0) return res.json([]);

    // 3. Extract the clean symbol strings into an array
    const symbols = matchingQuotes.map(item => item.symbol);

    // 4. Fetch the real-time prices for all those symbols at once
    const priceDataArray = await yahooFinance.quote(symbols);

    // If only one symbol was requested, quote returns an object instead of an array. 
    // Normalize it into an array format to easily map over it.
    const priceRecords = Array.isArray(priceDataArray) ? priceDataArray : [priceDataArray];

    // 5. Build your clean formatted list by combining search data with price data
    const formattedResults = matchingQuotes.map(searchItem => {
      // Find the matching price record for this specific symbol
      const liveData = priceRecords.find(p => p.symbol === searchItem.symbol);

      return {
        symbol: searchItem.symbol,
        name: searchItem.shortname || searchItem.longname || searchItem.symbol,
        asset_type: searchItem.quoteType,
        price: liveData?.regularMarketPrice || 0.00,
        price_change: liveData?.regularMarketChangePercent !== undefined 
          ? `${liveData.regularMarketChangePercent.toFixed(2)}%` 
          : '+0.00%'
      };
    });

    return res.json(formattedResults);

  } catch (error) {
    console.error("Autocomplete search error:", error.message);
    return res.status(500).json({
      error: "Discovery scanner failed",
      details: error.message
    });
  }
};
