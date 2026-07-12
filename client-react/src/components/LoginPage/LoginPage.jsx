import { useEffect, useState } from "react";
import authService from "../../services/authService";

//import googleService from "../../services/googleService";

function LoginPage({ auth, t }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      const response = await authService.register(username, email, password);

      if (!response.user) {
        throw new Error(t("AUTH_REGISTRATION_FAILED"));
      }

      setIsRegistering(false);

      handleLogin(e);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await authService.login(email, password);

      if (!response.user) {
        throw new Error(t("AUTH_INVALID_CREDENTIALS"));
      }

      auth.completeLogin(response.user, response.token);

      /*      setActivePortfolio(
        response.user.portfolios.find((p) => p.selected === 1).id,
      ); */

      //onRefresh();
    } catch (error) {
      setAuthError(error.message);
    }
  };

  useEffect(() => {
    if (auth.token || auth.user) return;
    /*
const initGoogle = () => {
      if (window.google && (!auth.token || !auth.user)) {
        window.google.accounts.id.initialize({
          client_id:
            "607204517221-liol36qcu1b51u42a69gid0fthokfvvc.apps.googleusercontent.com",
          callback: async (resObj) => {
            setAuthError("");
            try {
              const response = await googleService.google(
                JSON.stringify({ idToken: resObj.credential }),
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || "Verification rejected.");
              }

              auth.completeLogin(data.user, data.token);
            } catch (err) {
              setAuthError(err.message);
            }
          },
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtnAnchor"),
          { theme: "outline", size: "large", width: "340" },
        );
      }
    };
    if (window.google) {
      initGoogle();
    } else {
      window.addEventListener("load", initGoogle);
      return () => window.removeEventListener("load", initGoogle);
  }
        */
  }, [auth.user, auth.token]);

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
                autoFocus={isRegistering}
                type="text"
                placeholder="Type in your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  padding: "12px",
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
              autoFocus={!isRegistering}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "12px",
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
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
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
          </div>
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
          {isRegistering ? t("HAVE_ACCOUNT") : t("NEW_USER")} &nbsp;&nbsp;
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
