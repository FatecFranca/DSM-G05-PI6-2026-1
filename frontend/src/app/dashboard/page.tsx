"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCommodities, Commodity } from "@/services/commodities";
import "./dashboard-page.css";

/**
 * Mapeia a classificação da API externa para texto em português.
 * A API retorna: "bom" | "regular" | "ruim"
 */
function getClassificationLabel(classification: string): string {
  switch (classification.toLowerCase()) {
    case "bom":
      return "Bom para Compra";
    case "regular":
      return "Momento Regular";
    case "ruim":
      return "Aguarde";
    default:
      return classification;
  }
}

/**
 * Retorna a classe CSS do badge com base na classificação.
 */
function getClassificationCssClass(classification: string): string {
  switch (classification.toLowerCase()) {
    case "bom":
      return "good";
    case "regular":
      return "regular";
    case "ruim":
      return "bad";
    default:
      return "regular";
  }
}

export default function DashboardPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCommodities()
      .then(setCommodities)
      .catch(() => setError("Não foi possível carregar os dados. Verifique sua conexão."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Carregando dados do mercado...</p>
        </div>
        <div className="grid-cards">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card commodity-card" style={{ opacity: 0.4, minHeight: 120 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p style={{ color: "var(--danger, #ef4444)" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Acompanhe suas matérias-primas e veja a recomendação de IA.</p>
      </div>

      <div className="grid-cards">
        {commodities.map((item) => {
          const badgeClass = getClassificationCssClass(item.classification);
          const isUp = item.variation_percentage > 0;

          return (
            <Link
              href={`/dashboard/commodities/${item.id}`}
              key={item.id}
              className="card commodity-card"
            >
              <div className="commodity-header">
                <h3>{item.name}</h3>
                <span className={`badge ${badgeClass}`}>
                  {getClassificationLabel(item.classification)}
                </span>
              </div>

              <div className="commodity-price-info">
                <span className="price">R$ {item.actual_price.toFixed(2)}</span>
              </div>

              <div className="commodity-forecast">
                <span className="forecast-label">Variação prevista:</span>
                <span className={`forecast-value ${isUp ? "up" : "down"}`}>
                  {isUp ? "+" : ""}{item.variation_percentage.toFixed(2)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
