const googleService = {
  async google(idToken) {
    const response = await fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: idToken,
    });

    return response;
  },
};

export default googleService;
