const searchService = {
  async search(searchText) {
    const endpoint = `http://localhost:5000/api/search?query=${searchText}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    return json || [];
  },
};

export default searchService;
