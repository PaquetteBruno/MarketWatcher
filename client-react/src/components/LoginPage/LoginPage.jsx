function LoginPage({
  username,
  email,
  password,
  isRegistering,
  setIsRegistering,
  handleLogin,
  handleRegister,
  setUsername,
  setEmail,
  setPassword,
  authError,
  setAuthError,
  t,
}) {
  return (
    <div
      style={{
        backgroundColor: "#0d1117",
        color: "#c9d1d9",
        fontFamily: "sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
        gap: "20px",
      }}
    >
      <div
        style={{
          background: "#161b22",
          border: "1px solid #21262d",
          width: "100%",
          maxWidth: "400px",
          padding: "40px 30px",
          borderRadius: "10px",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              color: "#ffffff",
              margin: "0 0 10px 0",
              fontSize: "28px",
            }}
          >
            📈 {t("TITLE")}
          </h1>
          <p style={{ color: "#8b949e", margin: 0, fontSize: "14px" }}>
            {isRegistering ? t("CREATE_ACCOUNT") : t("LOGIN_METHOD")}
          </p>
        </header>
        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {isRegistering && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "13px", color: "#8b949e" }}>
                {t("USERNAME")}
              </label>
              <input
                type="text"
                placeholder="developer_bruno"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  padding: "12px",
                  background: "#010409",
                  color: "#fff",
                  border: "1px solid #21262d",
                  borderRadius: "6px",
                }}
              />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "#8b949e" }}>
              {t("EMAIL")}
            </label>
            <input
              type="email"
              placeholder="bruno@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "12px",
                background: "#010409",
                color: "#fff",
                border: "1px solid #21262d",
                borderRadius: "6px",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "#8b949e" }}>
              {t("PASSWORD")}
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "12px",
                background: "#010409",
                color: "#fff",
                border: "1px solid #21262d",
                borderRadius: "6px",
              }}
            />
          </div>
          {authError && (
            <p style={{ color: "#f85149", margin: 0, fontSize: "13px" }}>
              ⚠️ {authError}
            </p>
          )}
          <button
            type="submit"
            style={{
              padding: "12px",
              background: "#238636",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isRegistering ? t("REGISTER_ACCOUNT") : t("SIGN_IN")}
          </button>
        </form>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "20px",
            borderTop: "1px solid #21262d",
            paddingTop: "20px",
            alignItems: "center",
          }}
        >
          <div
            id="googleBtnAnchor"
            style={{
              width: "340px",
              display: "flex",
              justifyContent: "center",
              minHeight: "40px",
            }}
          ></div>
        </div>
        <footer
          style={{
            marginTop: "25px",
            textAlign: "center",
            fontSize: "13px",
            color: "#8b949e",
          }}
        >
          {isRegistering ? t("HAVE_ACCOUNT") : t("NEW_USER")}{" "}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setAuthError("");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#58a6ff",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            {isRegistering ? t("SIGN_IN") : t("CREATE_ACCOUNT")}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;
