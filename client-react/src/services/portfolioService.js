const portfolioService = {
  async updateSelected(portfolio_id) {
    const endpoint = `http://localhost:5000/api/portfolio/update-selected`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolio_id: portfolio_id,
      }),
    });

    const json = await response.json();
    return json.data || [];
  },

  async getPortfolioAssets(token, portfolio_id) {
    const endpoint = `http://localhost:5000/api/portfolio/${portfolio_id}`;
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
    portfolio_id,
    symbol,
    name,
    type,
    price,
    price_change,
  ) {
    await fetch("http://localhost:5000/api/portfolio/add-asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolio_id: portfolio_id,
        symbol: symbol,
        name: name,
        type: type,
        price: price,
        price_change: price_change,
      }),
    });
  },

  async deletePortfolioAsset(portfolio_id, symbol) {
    await fetch("http://localhost:5000/api/portfolio/remove-asset", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolio_id: portfolio_id, symbol: symbol }),
    });
  },
};

export default portfolioService;
