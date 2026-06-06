"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../login.css"; // Reaproveita os estilos do login
import ThemeToggle from "@/components/ThemeToggle";
import { register } from "@/services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name, email, password, phone);

      // Após registrar com sucesso, redireciona para o login
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer registro. Verifique os dados fornecidos.");
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
          <h1 className="login-title">Crie sua conta<span className="dot">.</span></h1>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Nome</label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            <div className="input-group">
              <label htmlFor="phone">Telefone</label>
              <input
                type="tel"
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </form>

          <div className="register-link-wrapper">
            <Link href="/" className="register-link">Já possui conta? Faça login</Link>
          </div>
        </div>
      </div>
      
      <div className="login-background"></div>
    </main>
  );
}
