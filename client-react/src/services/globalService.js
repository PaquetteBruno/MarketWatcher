const globalService = {
  async getGlobalData(token) {
    const response = await fetch("http://localhost:5000/api/global", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    return json.data || [];
  },
};

export default globalService;
