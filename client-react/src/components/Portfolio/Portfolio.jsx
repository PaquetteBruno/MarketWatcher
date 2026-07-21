import { useTranslation } from "react-i18next";
import { useState } from "react";
import ConfirmModal from "../ConfirmModal";
import portfolioService from "../../services/portfolioService";
function Portfolios({ auth, portfolio, handlePortfolioChange }) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(0);
  const [selectedPortfolioName, setSelectedPortfolioName] = useState("");
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingNewPortfolio, setEditingNewPortfolio] = useState("");

  const handleTrashClick = (id, name) => {
    setSelectedPortfolioId(id);
    setSelectedPortfolioName(name);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setModalOpen(false);
    setSelectedPortfolioId(0);
    setSelectedPortfolioName("");

    await portfolioService.deletePortfolio(auth.token, selectedPortfolioId);

    await loadPortfolios();

    const portfolioId = await portfolio.loadActivePortfolio(
      auth.token,
      auth.user.id,
    );
    await portfolio.loadAssets(auth.token, portfolioId);
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedPortfolioId(0);
    setSelectedPortfolioName("");
  };

  const savePortfolioName = async (selportfolio) => {
    if (editingName.trim() === "") {
      setEditingPortfolioId(null);
      return;
    }

    await portfolioService.updatePortfolio(
      auth.token,
      selportfolio.id,
      editingName,
      1,
    );

    await loadPortfolios();

    setEditingPortfolioId(null);
  };

  const loadPortfolios = async () => {
    const portfolios = await portfolioService.getPortfolios(
      auth.token,
      auth.user.id,
    );

    portfolio.setPortfolios(portfolios);
  };

  const saveNewPortfolio = async () => {
    if (editingNewPortfolio.trim() === "") {
      setEditingNewPortfolio(null);
    }

    await portfolioService.createPortfolio(
      auth.token,
      auth.user.id,
      editingNewPortfolio,
    );

    await loadPortfolios();

    const portfolioId = await portfolio.loadActivePortfolio(
      auth.token,
      auth.user.id,
    );

    await portfolio.loadAssets(auth.token, portfolioId);

    setEditingNewPortfolio(null);
  };

  return (
    <div
      style={{
        marginTop: "10px",
        display: "flex",
        flexWrap: "wrap",
        rowGap: "10px",
        background: "#161b22",
        padding: "8px",
      }}
    >
      {portfolio?.portfolios?.map((map) => (
        <div
          key={portfolio.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            padding: "8px 12px",
            marginRight: "-2px",

            borderRadius: map.id === portfolio.activePortfolio ? "6px" : "1px",
            border:
              map.id === portfolio.activePortfolio
                ? "1px solid #7d8fa3"
                : "1px solid #30363d",

            background:
              map.id === portfolio.activePortfolio ? "#21262d" : "transparent",
          }}
        >
          {editingPortfolioId === map.id ? (
            <input
              autoFocus
              onFocus={(e) => e.currentTarget.select()}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value.substring(0, 20))}
              onBlur={() => setEditingPortfolioId(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && map.name.length > 0) {
                  savePortfolioName(map);
                  loadPortfolios();
                }

                if (e.key === "Escape") {
                  setEditingPortfolioId(null);
                }
              }}
            />
          ) : (
            <span
              onClick={() => handlePortfolioChange(map.id, map.name, 1)}
              style={{
                cursor: "pointer",
                color:
                  map.id === portfolio.activePortfolio ? "#58a6ff" : "#a5b5c7",

                fontWeight:
                  map.id === portfolio.activePortfolio ? "600" : "500",

                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",

                flex: 1,
              }}
            >
              {map.name}
            </span>
          )}
          <button
            onClick={() => {
              setEditingPortfolioId(map.id);
              setEditingName(map.name);
            }}
            title={`${t("RENAME")}`}
            style={{
              cursor: "pointer",
              background: "none",
              border: "none",
              paddingRight: 5,
              paddingLeft: 40,
            }}
          >
            ✏️
          </button>

          {portfolio.portfolios.length > 1 && (
            <button
              title={`${t("DELETE")}`}
              onClick={() => {
                handleTrashClick(map.id, map.name);
              }}
              style={{
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              🗑️
            </button>
          )}
        </div>
      ))}
      {editingNewPortfolio != null ? (
        <input
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          value={editingNewPortfolio}
          onChange={(e) =>
            setEditingNewPortfolio(e.target.value.substring(0, 20))
          }
          onBlur={() => setEditingNewPortfolio(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.length > 0) {
              saveNewPortfolio();
              loadPortfolios();
            }

            if (e.key === "Escape") {
              setEditingNewPortfolio(null);
            }
          }}
        />
      ) : (
        <div
          onClick={() => setEditingNewPortfolio("New")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "140px",
            padding: "8px 12px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "1px solid #30363d",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              color: "#7ee787",
              fontWeight: "500",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              textAlign: "center",
              flex: 1,
            }}
          >
            🞦{" "}
            <span
              style={{ fontWeight: "bold" }}
            >{` ${t("NEW_PORTFOLIO")}`}</span>
          </span>
        </div>
      )}
      ;
      <ConfirmModal
        isOpen={modalOpen}
        message={`${t("DELETE_PORTFOLIO")} ${selectedPortfolioName}?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
export default Portfolios;
