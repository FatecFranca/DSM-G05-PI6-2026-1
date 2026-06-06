"use client";

import { useState } from "react";
import Link from "next/link";
import "./login.css";
import ThemeToggle from "@/components/ThemeToggle";
import { login } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      authLogin(data.accessToken, data.user);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      
      <div className="login-content">
        <div className="login-form-wrapper">
          <div style={{ marginBottom: '3rem' }}>
            <h2 className="brand-title" style={{ fontSize: '1.75rem' }}>Commodities <span className="brand-highlight">Analytics</span><span className="dot">.</span></h2>
          </div>
          <h1 className="login-title">Faça seu Login<span className="dot">.</span></h1>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="register-link-wrapper">
            <Link href="/register" className="register-link">Ainda não tenho uma conta</Link>
          </div>
        </div>
      </div>
      
      <div className="login-background"></div>
    </main>
  );
}
