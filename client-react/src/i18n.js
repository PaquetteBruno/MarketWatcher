import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 🌐 MULTI-LANGUAGE DICTIONARY TRANSLATION DICTS (EN, FR, ES)
const resources = {
  en: {
    translation: {
      TITLE: "Market Watcher",
      LOGIN_METHOD: "Choose your sign in method",
      CREATE_ACCOUNT: "Create Account",
      USERNAME: "Username",
      EMAIL: "Email",
      PASSWORD: "Password",
      SIGN_IN: "Sign In",
      REGISTER_ACCOUNT: "Register Account",
      HAVE_ACCOUNT: "Have an account?",
      NEW_USER: "New user?",
      AUTO_REFRESH: "Auto-Refresh:",
      LOG_IN_AS: "Logged in as:",
      SIGN_OUT: "Sign Out",
      SEARCH_ASSETS: "Search Assets",
      SEARCH_PLACEHOLDER: "Search an asset by symbol or company name (e.g. BTC, Apple, NVDA, Microsoft)",
      TAB_WATCHLIST: "⭐ My Watchlist",
      TAB_CRYPTO: "Crypto",
      TAB_ABOUT: "ℹ️ About",
      COL_SYMBOL: "SYMBOL",
      COL_NAME: "NAME",
      COL_EXCHANGE: "EXCHANGE",
      COL_PRICE: "PRICE",
      COL_CHANGE: "CHANGE",
      EMPTY_VIEW: "Nothing to display.",
      SHOW_CONSOLE: "Show Console",
      HIDE_CONSOLE: "Hide Console",
      CONSOLE_TITLE: "🖥️ System Console Logger",
      DB_CONNECTION_ERROR: "Error trying to connect to the database.",
      AUTH_MISSING_TOKEN: "Cannot find the authorization token.",
      AUTH_TOKEN_INVALID: "The authorization token is invalid.",
      AUTH_USER_EXISTS: "This user already exists.",
      AUTH_INVALID_CREDENTIALS: "Credentials are missing or invalid.",
      AUTH_INVALID_EMAIL_OR_PASSWORD: "Invalid email or password. ",
      AUTH_FAILED: "Authorization failed.",
      INTERNAL_SERVER_ERROR: "Internal server error, it might be down.",
      MISSING_GOOGLE_ID: "Missing Google Id.",
      AUTH_EMAIL_TAKEN: "This email is already taken.",
      GOOGLE_VERIFICATION_FAILED: "Google verification failed.",
      GOOGLE_ACCOUNT_CREATED: "Google account created",
      ACCOUNT_SUCCESSFULLY_GENERATED: "Account was created successfully, proceed to sign in.",
      MISSING_FIELDS: "Some fields are missing.",
      ASSET_SUCCESSFULLY_ADDED: "Asset successfully added to your list.",
      ASSET_SUCCESSFULLY_REMOVED: "Asset successfully removed from your list.",
      GOOGLE_ADSENSE_ERROR: "Error generating Google AdSense."
      
    }
  },
  fr: {
    translation: {
      TITLE: "Observateur de marché",
      LOGIN_METHOD: "Choisissez votre méthode de connexion",
      CREATE_ACCOUNT: "Créer un compte",
      USERNAME: "Nom d'utilisateur",
      EMAIL: "Courriel",
      PASSWORD: "Mot de passe",
      SIGN_IN: "Se connecter",
      REGISTER_ACCOUNT: "Enregistrer le compte",
      HAVE_ACCOUNT: "Vous avez déjà un compte ?",
      NEW_USER: "Nouvel utilisateur ?",
      AUTO_REFRESH: "Mise à jour :",
      LOG_IN_AS: "Connecté en tant que :",
      SIGN_OUT: "Déconnexion",
      SEARCH_ASSETS: "Rechercher des actifs",
      SEARCH_PLACEHOLDER: "Symbole de l'actif ou nom de l'entreprise (ex: BTC, Apple, NVDA)",
      TAB_WATCHLIST: "⭐ Ma Liste",
      TAB_CRYPTO: "Crypto",
      TAB_ABOUT: "ℹ️ À Propos",
      COL_SYMBOL: "SYMBOLE",
      COL_NAME: "NOM",
      COL_EXCHANGE: "BOURSE",
      COL_PRICE: "PRIX",
      COL_CHANGE: "VARIATION",
      EMPTY_VIEW: "Rien à afficher.",
      SHOW_CONSOLE: "Afficher la console",
      HIDE_CONSOLE: "Masquer la console",
      CONSOLE_TITLE: "🖥️ Console d'analyse système"
    }
  },
  es: {
    translation: {
      TITLE: "Observación del mercado",
      LOGIN_METHOD: "Elija su método de inicio de sesión",
      CREATE_ACCOUNT: "Crear Cuenta",
      USERNAME: "Nombre de usuario",
      EMAIL: "Correo electrónico",
      PASSWORD: "Contraseña",
      SIGN_IN: "Iniciar Sesión",
      REGISTER_ACCOUNT: "Registrar Cuenta",
      HAVE_ACCOUNT: "¿Ya tienes una cuenta?",
      NEW_USER: "¿Nuevo usuario?",
      AUTO_REFRESH: "Actualización:",
      LOG_IN_AS: "Conectado como:",
      SIGN_OUT: "Cerrar Sesión",
      SEARCH_ASSETS: "Buscar Activos",
      SEARCH_PLACEHOLDER: "Símbolo del activo o nombre de la empresa (ej: BTC, Apple, NVDA)",
      TAB_WATCHLIST: "⭐ Mi Lista",
      TAB_CRYPTO: "Cripto",
      TAB_ABOUT: "ℹ️ Acerca de",
      COL_SYMBOL: "SÍMBOLO",
      COL_NAME: "NOMBRE",
      COL_EXCHANGE: "BOLSA",
      COL_PRICE: "PRECIO",
      COL_CHANGE: "CAMBIO",
      EMPTY_VIEW: "Nada que mostrar.",
      SHOW_CONSOLE: "Mostrar Consola",
      HIDE_CONSOLE: "Ocultar Consola",
      CONSOLE_TITLE: "🖥️ Consola de diagnóstico del sistema"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Baseline standard startup language configuration
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
