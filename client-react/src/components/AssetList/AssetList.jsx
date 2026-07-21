import { useTranslation } from "react-i18next";
import { useState } from "react";
import ConfirmModal from "../ConfirmModal";

function AssetList({ portfolioAssets, removeAssetFromPortfolio }) {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");

  const handleTrashClick = (symbol) => {
    setSelectedSymbol(symbol);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    removeAssetFromPortfolio(selectedSymbol);
    setModalOpen(false);
    setSelectedSymbol("");
  };

  // 6. Triggered when the user clicks "Cancel" inside the modal
  const handleCancelDelete = () => {
    setModalOpen(false); // Close the modal
    setSelectedSymbol(""); // Reset state
  };

  return (
    <div
      style={{
        background: "#161b22",
        border: "0px solid #21262d",
        borderRadius: "1px",
        padding: "0px 00px",
        marginBottom: "20px",
        overflowX: "auto",
      }}
    >
      {portfolioAssets.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr
              style={{
                //borderBottom: "1px solid #30363d",
                fontSize: "13px",
                color: "#c1bebe",
              }}
            >
              <th style={{ padding: "12px 12px", width: "15%" }}>
                {t("SYMBOL")}
              </th>
              <th style={{ padding: "12px 12px", width: "35%" }}>
                {t("NAME")}
              </th>
              <th style={{ padding: "12px 12px", width: "20%" }}>
                {t("TYPE")}
              </th>
              <th
                style={{
                  padding: "12px 12px",
                  width: "15%",
                  textAlign: "right",
                }}
              >
                {t("PRICE")}
              </th>
              <th
                style={{
                  padding: "12px 12px",
                  width: "10%",
                  textAlign: "right",
                }}
              >
                24h %
              </th>
              <th style={{ padding: "1px 1px", width: "5%" }}></th>
            </tr>
          </thead>
          <tbody>
            {portfolioAssets.map((asset) => {
              const isPos =
                asset.price_change && !asset.price_change.startsWith("-");
              const rBg = "transparent";
              return (
                <tr
                  key={asset.symbol}
                  style={{
                    borderTop: "0.5px solid #21262d",
                    borderBottom: "0.5px solid #21262d",
                    fontSize: "14px",
                    background: rBg,
                    transition: "background 0.2s",
                  }}
                >
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      padding: "6px 12px",
                      fontWeight: "500",
                      color: "#ffffff",
                    }}
                  >
                    {asset.symbol}
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      padding: "6px 12px",
                      color: "#c9d1d9",
                    }}
                    title={asset.name}
                  >
                    {asset.name}
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      padding: "6px 12px",
                      color: "#ffffff",
                      fontSize: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    {asset.type}
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      padding: "6px 12px",
                      color: "#ffffff",
                      fontFamily: "monospace",
                      textAlign: "right",
                    }}
                  >
                    $
                    {parseFloat(asset.price || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      padding: "6px 12px",
                      color: isPos ? "#3fb950" : "#f85149",
                      fontWeight: "700",
                      fontFamily: "monospace",
                      textAlign: "right",
                    }}
                  >
                    {asset.price_change}
                  </td>
                  <td
                    style={{
                      padding: "6px 12px",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => handleTrashClick(asset.symbol)}
                      style={{
                        background: "transparent",
                        color: "#8b949e",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div
          style={{
            padding: "30px 10px",
            textAlign: "center",
            color: "#8b949e",
          }}
        >
          {t("EMPTY_LIST")}
        </div>
      )}
      <ConfirmModal
        isOpen={modalOpen}
        message={`${t("REMOVE")} ${selectedSymbol} ${t("FROM_THIS_PORTFOLIO")} ?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default AssetList;
