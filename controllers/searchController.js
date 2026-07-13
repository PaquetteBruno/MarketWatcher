import YahooFinanceClass from "yahoo-finance2";

const yahooFinance = new YahooFinanceClass({
  suppressNotices: ["yahooSurvey"],
});

export const searchAssets = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Missing query parameter" });

    const searchResults = await yahooFinance.search(query, { newsCount: 0 });

    if (
      !searchResults ||
      !searchResults.quotes ||
      searchResults.quotes.length === 0
    ) {
      return res.json([]);
    }

    const matchingQuotes = searchResults.quotes
      .filter((item) => item?.isYahooFinance)
      .slice(0, 5);

    if (matchingQuotes.length === 0) return res.json([]);

    const symbols = matchingQuotes.map((item) => item.symbol);

    const priceDataArray = await yahooFinance.quote(symbols);

    const priceRecords = Array.isArray(priceDataArray)
      ? priceDataArray
      : [priceDataArray];

    const formattedResults = matchingQuotes.map((searchItem) => {
      const liveData = priceRecords.find((p) => p.symbol === searchItem.symbol);

      return {
        symbol: searchItem.symbol,
        name: searchItem.shortname || searchItem.longname || searchItem.symbol,
        asset_type: searchItem.quoteType,
        price: liveData?.regularMarketPrice || 0.0,
        price_change:
          liveData?.regularMarketChangePercent !== undefined
            ? `${liveData.regularMarketChangePercent.toFixed(2)}%`
            : "+0.00%",
      };
    });

    return res.json(formattedResults);
  } catch (err) {
    next(err);
  }
};
