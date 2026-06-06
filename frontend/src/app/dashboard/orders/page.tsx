"use client";

import { useState, useEffect } from "react";
import { Commodity, CommodityDetail, getCommodities, getCommodityById } from "@/services/commodities";
import "./orders.css";

export default function OrdersPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selectedCommodityId, setSelectedCommodityId] = useState("");
  const [commodityDetail, setCommodityDetail] = useState<CommodityDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  const [quantity, setQuantity] = useState("");
  const [pricePaid, setPricePaid] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    getCommodities().then(setCommodities);
  }, []);

  useEffect(() => {
    if (!selectedCommodityId) {
      setCommodityDetail(null);
      return;
    }
    
    let isMounted = true;
    setIsLoadingDetail(true);
    setShowResult(false);
    
    getCommodityById(selectedCommodityId)
      .then((detail) => {
        if (isMounted && detail) {
          setCommodityDetail(detail);
        }
      })
      .catch((err) => console.error("Erro ao carregar detalhes:", err))
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => { isMounted = false; };
  }, [selectedCommodityId]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (commodityDetail && quantity && pricePaid) {
      setShowResult(true);
    }
  };

  let spotSavings = 0;
  let futureSavings = 0;
  
  if (showResult && commodityDetail && quantity && pricePaid) {
    const qty = parseFloat(quantity);
    const paid = parseFloat(pricePaid);
    
    spotSavings = (commodityDetail.preco_atual - paid) * qty;
    futureSavings = (commodityDetail.previsao_media_futura - paid) * qty;
  }

  const getRecommendation = () => {
    if (futureSavings > 0 && spotSavings > 0) {
      return "Excelente negócio estratégico! Você comprou abaixo do mercado atual e já garantiu proteção contra a inflação projetada para o futuro. Ótima oportunidade para estocar.";
    } else if (futureSavings > 0 && spotSavings <= 0) {
      return "Embora o preço pago esteja acima do mercado atual, a projeção futura indica alta. No longo prazo, essa compra se provará vantajosa.";
    } else if (futureSavings <= 0 && spotSavings > 0) {
      return "Boa compra imediata, mas as projeções indicam queda futura. Cuidado com estoques muito longos, pois o ativo tende a desvalorizar.";
    } else {
      return "Atenção: Compra acima do preço de mercado atual e com projeção futura de queda. Considere renegociar com seus fornecedores ou adiar grandes aquisições.";
    }
  };

  return (
    <div className="orders-wrapper">
      <div className="orders-header">
        <h1 className="modern-title">Simulação Estratégica de Compras</h1>
        <p className="modern-subtitle">Analise o ROI da sua compra com base em dados em tempo real e projeções de Inteligência Artificial.</p>
      </div>

      <div className="orders-split-layout">
        <div className="orders-left-column">
          <form className="modern-form card glass" onSubmit={handleCalculate}>
            <div className="form-section-title">Detalhes da Transação</div>
            
            <div className="modern-input-group full-width">
              <label htmlFor="commodity">Matéria-Prima</label>
              <div className="select-wrapper">
                <select 
                  id="commodity" 
                  required
                  value={selectedCommodityId}
                  onChange={(e) => setSelectedCommodityId(e.target.value)}
                >
                  <option value="" disabled>Selecione a commodity</option>
                  {commodities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row-modern">
              <div className="modern-input-group">
                <label htmlFor="quantity">Quantidade (KG)</label>
                <div className="input-with-icon">
                  <span className="icon">📦</span>
                  <input 
                    type="number" 
                    id="quantity" 
                    min="1" 
                    step="0.01"
                    placeholder="Ex: 500" 
                    required 
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setShowResult(false);
                    }}
                  />
                </div>
              </div>
              
              <div className="modern-input-group">
                <label htmlFor="pricePaid">Preço Negociado (Unitário)</label>
                <div className="input-with-icon">
                  <span className="icon">R$</span>
                  <input 
                    type="number" 
                    id="pricePaid" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00" 
                    required 
                    value={pricePaid}
                    onChange={(e) => {
                      setPricePaid(e.target.value);
                      setShowResult(false);
                    }}
                  />
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-modern-primary mt-4" 
              disabled={isLoadingDetail || !selectedCommodityId}
            >
              Executar Análise de ROI
            </button>
          </form>

          {/* AI Analysis Card */}
          {showResult && commodityDetail && !isLoadingDetail && (
            <div className="ai-analysis-card mt-4">
              <div className="ai-header">
                <span className="ai-icon">✨</span>
                <h3>Análise da IA: {commodityDetail.modelo_utilizado}</h3>
              </div>
              <div className="ai-body">
                <div className="ai-classification">
                  <strong>Status de Mercado:</strong> 
                  <span className={`badge ${commodityDetail.classificacao.toLowerCase()}`}>
                    {commodityDetail.classificacao.toUpperCase()}
                  </span>
                </div>
                <p className="ai-justification">
                  {commodityDetail.justificativa}
                </p>
                <div className="ai-future-price">
                  <span>Previsão Média Futura:</span>
                  <strong>R$ {commodityDetail.previsao_media_futura.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="orders-results-area">
          {isLoadingDetail ? (
             <div className="loading-placeholder card">
               <div className="spinner"></div>
               <p>Nossa IA está processando o histórico e tendências...</p>
             </div>
          ) : !showResult ? (
             <div className="empty-placeholder card">
               Preencha os detalhes e execute a análise para obter o veredito da IA.
             </div>
          ) : commodityDetail && (
            <>
              <div className="reference-card card">
                <div className="ref-label">Referência Spot (Hoje)</div>
                <div className="ref-value">
                  R$ {commodityDetail.preco_atual.toFixed(2)}
                </div>
                <div className="ref-trend">
                  Variação recente: 
                  <span className={`badge ${commodityDetail.variacao_percentual > 0 ? 'bad' : 'good'}`}>
                    {commodityDetail.variacao_percentual > 0 ? '+' : ''}{commodityDetail.variacao_percentual.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className={`result-card-modern ${futureSavings >= 0 ? 'good-deal' : 'bad-deal'}`}>
                <div className="result-backdrop"></div>
                <div className="result-content advanced-result">
                
                <div className="result-section">
                  <div className="result-badge">Economia Spot (Imediata)</div>
                  <div className={`result-value ${spotSavings >= 0 ? 'positive' : 'negative'}`}>
                    R$ {Math.abs(spotSavings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    <span className="indicator">{spotSavings >= 0 ? 'Ganhos' : 'Perdas'}</span>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="result-section">
                  <div className="result-badge">ROI Futuro Projetado</div>
                  <div className={`result-value ${futureSavings >= 0 ? 'positive' : 'negative'}`}>
                    R$ {Math.abs(futureSavings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    <span className="indicator">{futureSavings >= 0 ? 'Lucro Estimado' : 'Risco Estimado'}</span>
                  </div>
                </div>

                <div className="recommendation-panel">
                  <div className="rec-title">Veredito da IA</div>
                  <p className="rec-text">{getRecommendation()}</p>
                </div>

              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
