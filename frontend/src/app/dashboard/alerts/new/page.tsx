"use client";

import { useState, useEffect } from "react";
import { createAlert } from "@/services/alerts";
import { Commodity, getCommodities } from "@/services/commodities";
import Link from "next/link";
import { SiTelegram, SiWhatsapp, SiGmail } from "react-icons/si";
import "../alerts.css";

export default function NewAlertPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selectedCommodityId, setSelectedCommodityId] = useState("");
  const [condition, setCondition] = useState("Abaixo");
  const [targetPrice, setTargetPrice] = useState("");
  const [channel, setChannel] = useState("Telegram");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCommodities().then(setCommodities);
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const comm = commodities.find(c => c.id === selectedCommodityId);
    if (!comm) return;

    setIsSubmitting(true);

    try {
      const newAlert = {
        commodityId: parseInt(selectedCommodityId, 10),
        condition: condition as 'Abaixo' | 'Acima' | 'bom',
        targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
        channel: channel as 'Telegram' | 'WhatsApp' | 'E-mail',
      };

      await createAlert(newAlert);
      setIsSuccess(true);

      // Reset form
      setSelectedCommodityId("");
      setTargetPrice("");
      setCondition("Abaixo");
      setChannel("Telegram");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar alerta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setIsSuccess(false);
  };

  return (
    <div className="alerts-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="alerts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="modern-title">Novo Alerta</h1>
          <p className="modern-subtitle">Configure uma nova regra para ser avisado sobre o mercado.</p>
        </div>
        <Link href="/dashboard/alerts" className="btn-modern-action">
          ← Voltar para Alertas
        </Link>
      </div>

      {isSuccess ? (
        <div className="card glass scale-in" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--status-good)' }}>Alerta Criado com Sucesso!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            A regra foi salva e você será notificado assim que a condição for atingida.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={handleCreateAnother} className="btn-modern-action">
              Criar Outro
            </button>
            <Link href="/dashboard/alerts" className="btn-modern-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Ver Meus Alertas
            </Link>
          </div>
        </div>
      ) : (
        <form className="modern-form card glass" onSubmit={handleCreateAlert}>


          <div className="modern-input-group full-width">
            <label htmlFor="commodity">Matéria-Prima</label>
            <div className="select-wrapper">
              <select
                id="commodity"
                required
                value={selectedCommodityId}
                onChange={e => setSelectedCommodityId(e.target.value)}
              >
                <option value="" disabled>Selecione a commodity</option>
                {commodities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modern-input-group full-width">
            <label htmlFor="condition">Qual a condição?</label>
            <div className="select-wrapper">
              <select
                id="condition"
                value={condition}
                onChange={e => setCondition(e.target.value)}
              >
                <option value="Abaixo">Preço cair abaixo de</option>
                <option value="Acima">Preço subir acima de</option>
                <option value="bom">Recomendação da IA mudar para Bom</option>
              </select>
            </div>
          </div>

          {condition !== "bom" && (
            <div className="modern-input-group full-width">
              <label htmlFor="targetPrice">Preço alvo (R$)</label>
              <div className="input-with-icon">
                <span className="icon">R$</span>
                <input
                  type="number"
                  step="0.01"
                  id="targetPrice"
                  required
                  placeholder="Ex: 50.00"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <div className="modern-input-group full-width">
            <label>Receber por</label>
            <div className="channels-group" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setChannel('Telegram')}
                disabled={isSubmitting}
                style={{
                  flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${channel === 'Telegram' ? '#26A5E4' : 'var(--border-color)'}`,
                  background: channel === 'Telegram' ? 'rgba(38, 165, 228, 0.05)' : 'var(--bg-surface)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  color: 'var(--text-primary)', transition: 'all 0.2s',
                  boxShadow: channel === 'Telegram' ? '0 4px 12px rgba(38, 165, 228, 0.15)' : 'none'
                }}
              >
                <SiTelegram size={24} color={channel === 'Telegram' ? '#26A5E4' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '0.85rem', fontWeight: channel === 'Telegram' ? '700' : '500' }}>Telegram</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('WhatsApp')}
                disabled={isSubmitting}
                style={{
                  flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${channel === 'WhatsApp' ? '#25D366' : 'var(--border-color)'}`,
                  background: channel === 'WhatsApp' ? 'rgba(37, 211, 102, 0.05)' : 'var(--bg-surface)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  color: 'var(--text-primary)', transition: 'all 0.2s',
                  boxShadow: channel === 'WhatsApp' ? '0 4px 12px rgba(37, 211, 102, 0.15)' : 'none'
                }}
              >
                <SiWhatsapp size={24} color={channel === 'WhatsApp' ? '#25D366' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '0.85rem', fontWeight: channel === 'WhatsApp' ? '700' : '500' }}>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('E-mail')}
                disabled={isSubmitting}
                style={{
                  flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${channel === 'E-mail' ? '#EA4335' : 'var(--border-color)'}`,
                  background: channel === 'E-mail' ? 'rgba(234, 67, 53, 0.05)' : 'var(--bg-surface)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  color: 'var(--text-primary)', transition: 'all 0.2s',
                  boxShadow: channel === 'E-mail' ? '0 4px 12px rgba(234, 67, 53, 0.15)' : 'none'
                }}
              >
                <SiGmail size={24} color={channel === 'E-mail' ? '#EA4335' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '0.85rem', fontWeight: channel === 'E-mail' ? '700' : '500' }}>E-mail</span>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-modern-primary mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Regra"}
          </button>
        </form>
      )}
    </div>
  );
}
