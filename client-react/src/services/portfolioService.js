const portfolioService = {
  async updateSelected(portfolioId) {
    const endpoint = `http://localhost:5000/api/portfolio/update-selected`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolioId: portfolioId,
      }),
    });

    const json = await response.json();
    return json.data || [];
  },

  async getSelectedPortfolio(token, userId) {
    const endpoint = `http://localhost:5000/api/portfolio/selected/${userId}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    return json.data.id || [];
  },

  async getPortfolioAssets(token, portfolioId) {
    const endpoint = `http://localhost:5000/api/portfolio/${portfolioId}/assets`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    return json.data || [];
  },

  async addPortfolioAsset(
    portfolioId,
    symbol,
    name,
    type,
    price,
    price_change,
  ) {
    await fetch(
      `http://localhost:5000/api/portfolio/${portfolioId}/assets/${symbol}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioId: portfolioId,
          symbol: symbol,
          name: name,
          type: type,
          price: price,
          price_change: price_change,
        }),
      },
    );
  },

  async deletePortfolioAsset(portfolioId, symbol) {
    await fetch(
      `http://localhost:5000/api/portfolio/${portfolioId}/assets/${symbol}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId: portfolioId, symbol: symbol }),
      },
    );
  },
};

export default portfolioService;
