"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommodityChart from "@/components/CommodityChart";
import { getCommodityById, CommodityDetail } from "@/services/commodities";
import "../commodity-detail.css";

type Params = Promise<{ id: string }>;
type ChartView = "historico" | "previsoes";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getClassBadge(cls: string) {
  const map: Record<string, string> = {
    bom: "good",
    regular: "regular",
    ruim: "bad",
  };
  return map[cls?.toLowerCase()] ?? "regular";
}

function getClassLabel(cls: string) {
  const map: Record<string, string> = {
    bom: "Bom para Compra",
    regular: "Momento Regular",
    ruim: "Aguarde",
  };
  return map[cls?.toLowerCase()] ?? cls;
}

// ── Modal de Detalhes ────────────────────────────────────────────────────────

function DetailsModal({
  commodity,
  onClose,
}: {
  commodity: CommodityDetail;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{commodity.nome}</h2>
            <p>ID: {commodity.id_materia_prima}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>

        {/* KPIs principais */}
        <div className="modal-section">
          <h3>Resumo de Preços</h3>
          <div className="modal-kpi-grid">
            <div className="modal-kpi">
              <div className="kpi-label">Preço Atual</div>
              <div className="kpi-value">
                R$ {commodity.preco_atual.toFixed(2)}
              </div>
            </div>
            <div className="modal-kpi">
              <div className="kpi-label">Previsão Média Futura</div>
              <div className="kpi-value">
                R$ {commodity.previsao_media_futura.toFixed(2)}
              </div>
            </div>
            <div className="modal-kpi">
              <div className="kpi-label">Variação Prevista</div>
              <div
                className="kpi-value"
                style={{
                  color:
                    commodity.variacao_percentual >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {commodity.variacao_percentual > 0 ? "+" : ""}
                {commodity.variacao_percentual.toFixed(2)}%
              </div>
            </div>
            <div className="modal-kpi">
              <div className="kpi-label">Classificação IA</div>
              <div className="kpi-value">
                <span
                  className={`badge ${getClassBadge(commodity.classificacao)}`}
                >
                  {getClassLabel(commodity.classificacao)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Justificativa */}
        <div className="modal-section">
          <h3>Análise da IA</h3>
          <div className="modal-justificativa">{commodity.justificativa}</div>
        </div>

        {/* Histórico */}
        <div className="modal-section">
          <h3>Histórico de Preços</h3>
          <table className="modal-table">
            <thead>
              <tr>
                <th>Data Referência</th>
                <th>Preço Médio</th>
                <th>Fonte</th>
                <th>Região</th>
              </tr>
            </thead>
            <tbody>
              {commodity.historico.map((h, i) => (
                <tr key={i}>
                  <td>{h.data_referencia}</td>
                  <td>R$ {h.preco_medio.toFixed(2)}</td>
                  <td>{h.fonte_dado ?? "—"}</td>
                  <td>{h.regiao ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Previsões */}
        <div className="modal-section">
          <h3>Previsões Futuras</h3>
          <table className="modal-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Preço Previsto</th>
                <th>Variação %</th>
              </tr>
            </thead>
            <tbody>
              {commodity.previsoes.map((p, i) => (
                <tr key={i}>
                  <td>{p.periodo}</td>
                  <td>R$ {p.preco_previsto.toFixed(2)}</td>
                  <td
                    style={{ color: p.variacao_pct >= 0 ? "#10b981" : "#ef4444" }}
                  >
                    {p.variacao_pct > 0 ? "+" : ""}
                    {p.variacao_pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Meta do modelo */}
        <div className="modal-section">
          <h3>Informações do Modelo</h3>
          <div className="modal-meta">
            <span>
              Modelo: <strong>{commodity.modelo_utilizado}</strong>
            </span>
            <span>
              Gerado em:{" "}
              <strong>{formatDate(commodity.data_geracao)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function CommodityDetailPage({ params }: { params: Params }) {
  const { id: commodityId } = use(params);
  const [commodity, setCommodity] = useState<CommodityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [chartView, setChartView] = useState<ChartView>("historico");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getCommodityById(commodityId)
      .then((data) => {
        if (!data) {
          setNotFoundFlag(true);
        } else {
          setCommodity(data);
        }
      })
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoading(false));
  }, [commodityId]);

  // Fechar modal com Esc
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showModal]);

  if (notFoundFlag) {
    notFound();
  }

  if (loading || !commodity) {
    return (
      <div className="commodity-detail">
        <div className="back-link">
          <Link href="/dashboard">← Voltar para Dashboard</Link>
        </div>
        <div className="detail-header" style={{ opacity: 0.4 }}>
          <div>
            <h1>Carregando...</h1>
            <div className="price-big">R$ --,--</div>
          </div>
        </div>
      </div>
    );
  }

  // Dados para o gráfico de histórico (shape esperado pelo CommodityChart)
  const historyChartData = commodity.historico.map((h) => ({
    date: h.data_referencia,
    price: h.preco_medio,
  }));

  // Dados para o gráfico de previsões
  const forecastChartData = commodity.previsoes.map((f) => ({
    date: f.periodo,
    price: f.preco_previsto,
  }));

  const activeChartData =
    chartView === "historico" ? historyChartData : forecastChartData;

  const isGood = commodity.classificacao?.toLowerCase() === "bom";
  const isRegular = commodity.classificacao?.toLowerCase() === "regular";

  return (
    <>
      {showModal && (
        <DetailsModal
          commodity={commodity}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="commodity-detail">
        <div className="back-link">
          <Link href="/dashboard">← Voltar para Dashboard</Link>
        </div>

        <div className="detail-header">
          <div>
            <h1>{commodity.nome}</h1>
            <div className="price-big">
              R$ {commodity.preco_atual.toFixed(2)}
            </div>
          </div>
          <div className="header-actions">
            <Link href="/dashboard/orders" className="btn-primary">
              Registrar Compra
            </Link>
            <Link href="/dashboard/alerts" className="btn-secondary">
              Criar Alerta
            </Link>
          </div>
        </div>

        <div className="insight-grid">
          {/* Card de Previsão IA */}
          <div className="card ai-insight glass">
            <div className="insight-header">
              <h3>Previsão IA</h3>
              <span className={`badge ${getClassBadge(commodity.classificacao)}`}>
                {getClassLabel(commodity.classificacao)}
              </span>
            </div>
            <div className="insight-body">
              <div className="forecast-big">
                {commodity.variacao_percentual > 0 ? "+" : ""}
                {commodity.variacao_percentual.toFixed(2)}%
              </div>
              <p className="insight-text">
                {isGood
                  ? `A tendência indica alta de ${commodity.variacao_percentual.toFixed(2)}% em relação à previsão futura (R$ ${commodity.previsao_media_futura.toFixed(2)}). ${commodity.justificativa}`
                  : isRegular
                  ? `O mercado apresenta variação moderada de ${commodity.variacao_percentual.toFixed(2)}%. ${commodity.justificativa}`
                  : `A tendência indica queda. ${commodity.justificativa}`}
              </p>
              <button
                className="btn-details"
                onClick={() => setShowModal(true)}
              >
                🔍 Mais Detalhes
              </button>
            </div>
          </div>

          {/* Card do Gráfico com Toggle */}
          <div className="card chart-card">
            <div className="chart-header">
              <h3>
                {chartView === "historico"
                  ? "Histórico de Preços"
                  : "Previsões Futuras"}
              </h3>
              <div className="chart-toggle">
                <button
                  className={`chart-toggle-btn ${chartView === "historico" ? "active" : ""}`}
                  onClick={() => setChartView("historico")}
                >
                  📈 Histórico
                </button>
                <button
                  className={`chart-toggle-btn ${chartView === "previsoes" ? "active" : ""}`}
                  onClick={() => setChartView("previsoes")}
                >
                  🔮 Previsões
                </button>
              </div>
            </div>
            <CommodityChart
              data={activeChartData}
              unit="Saca 60kg"
              isForecast={chartView === "previsoes"}
            />
          </div>
        </div>
      </div>
    </>
  );
}
