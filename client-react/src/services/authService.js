const authService = {
  async register(username, email, password) {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    });

    const json = await response.json();
    return json;
  },

  async login(email, password) {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const json = await response.json();
    return json;
  },
};

export default authService;
