"use client";

import { useState, useEffect } from "react";
import { AlertModel, getAlerts, toggleAlertStatus, deleteAlert } from "@/services/alerts";
import { Commodity, getCommodities } from "@/services/commodities";
import Link from "next/link";
import { SiTelegram, SiWhatsapp, SiGmail } from "react-icons/si";
import "./alerts.css";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("todos");
  const [commodityFilter, setCommodityFilter] = useState("todas");

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedAlerts, fetchedCommodities] = await Promise.all([
      getAlerts(),
      getCommodities()
    ]);
    setAlerts(fetchedAlerts);
    setCommodities(fetchedCommodities);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string) => {
    await toggleAlertStatus(id);
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleDelete = async (id: string) => {
    await deleteAlert(id);
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (statusFilter === "ativos" && !alert.active) return false;
    if (statusFilter === "inativos" && alert.active) return false;

    if (commodityFilter !== "todas" && alert.commodityName !== commodityFilter) return false;

    return true;
  });

  return (
    <div className="alerts-wrapper">
      <div className="alerts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="modern-title">Meus Alertas</h1>
          <p className="modern-subtitle">Gerencie suas regras de notificação sobre o mercado.</p>
        </div>
        <Link href="/dashboard/alerts/new" className="btn-modern-primary" style={{ textDecoration: 'none' }}>
          + Novo Alerta
        </Link>
      </div>

      <div className="alerts-split-layout" style={{ gridTemplateColumns: 'minmax(250px, 1fr) 3fr' }}>
        {/* Sidebar for Filters */}
        <div className="modern-form card glass" style={{ height: 'fit-content' }}>
          <div className="form-section-title">Filtros</div>

          <div className="modern-input-group full-width">
            <label htmlFor="statusFilter">Status</label>
            <div className="select-wrapper">
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="ativos">Apenas Ativos</option>
                <option value="inativos">Apenas Inativos</option>
              </select>
            </div>
          </div>

          <div className="modern-input-group full-width" style={{ marginTop: '1rem' }}>
            <label htmlFor="commodityFilter">Produto</label>
            <div className="select-wrapper">
              <select
                id="commodityFilter"
                value={commodityFilter}
                onChange={e => setCommodityFilter(e.target.value)}
              >
                <option value="todas">Todos os Produtos</option>
                {commodities.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content for List */}
        <div className="alerts-results-area">
          {isLoading ? (
            <div className="empty-placeholder card glass">Carregando alertas...</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="empty-placeholder card glass">
              Nenhum alerta encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="alerts-list">
              {filteredAlerts.map(alert => (
                <div key={alert.id} className={`result-card-modern ${alert.active ? 'active-deal' : 'inactive-deal'}`}>
                  <div className="result-backdrop"></div>
                  <div className="result-content alert-card-content">
                    <div className="alert-header">
                      <div className="alert-commodity">{alert.commodityName}</div>
                      <div className={`result-badge ${alert.active ? 'active-badge' : 'inactive-badge'}`}>
                        {alert.active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>

                    <div className="alert-condition-text">
                      <span className="icon">🎯</span> {alert.condition}
                    </div>

                    <div className="alert-channel-info">
                      <span className="icon" style={{ display: 'flex', alignItems: 'center' }}>
                        {alert.channel === "Telegram" ? <SiTelegram color="#26A5E4" /> :
                          alert.channel === "WhatsApp" ? <SiWhatsapp color="#25D366" /> :
                            alert.channel === "E-mail" ? <SiGmail color="#EA4335" /> : "📱"}
                      </span> via {alert.channel}
                    </div>

                    <div className="alert-modern-actions">
                      <button
                        type="button"
                        className={`btn-modern-action ${alert.active ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleToggle(alert.id)}
                      >
                        {alert.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        type="button"
                        className="btn-modern-action btn-delete-modern"
                        onClick={() => handleDelete(alert.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
