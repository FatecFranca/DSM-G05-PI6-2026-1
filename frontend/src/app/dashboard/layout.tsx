"use client";

import "./dashboard.css";
import Link from "next/link";
import React, { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import GeminiChatDrawer from "@/components/GeminiChatDrawer";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FiHome, 
  FiShoppingCart, 
  FiBell, 
  FiUsers, 
  FiChevronDown, 
  FiMenu,
  FiMessageSquare 
} from "react-icons/fi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="dashboard-layout">
      {/* Modern Top Header */}
      <header className="top-header">
        <div className="header-left">
          <h2 className="brand-title">Commodities <span className="brand-highlight">Analytics</span><span className="dot">.</span></h2>
        </div>

        <div className="header-right">
          <ThemeToggle />
          <div className="user-profile">
            <div className="user-avatar">{user ? getInitials(user.name) : "US"}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || "Usuário"}</span>
              <span className="user-role">Comprador</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
            Sair
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <div className="content-scrollable">
          {children}
        </div>
      </main>

      {/* Floating Dock Navigation */}
      <div className={`floating-dock-container ${isDockVisible ? '' : 'hidden'}`}>
        <nav className="floating-dock">
          <Link href="/dashboard" className={`dock-item ${pathname === '/dashboard' ? 'active' : ''}`}>
            <FiHome className="dock-item-icon" />
            <span className="dock-label">Dashboard</span>
          </Link>
          <Link href="/dashboard/orders" className={`dock-item ${pathname === '/dashboard/orders' ? 'active' : ''}`}>
            <FiShoppingCart className="dock-item-icon" />
            <span className="dock-label">Compras</span>
          </Link>
          <Link href="/dashboard/alerts" className={`dock-item ${pathname === '/dashboard/alerts' ? 'active' : ''}`}>
            <FiBell className="dock-item-icon" />
            <span className="dock-label">Alertas</span>
          </Link>
          <Link href="/dashboard/suppliers" className={`dock-item ${pathname === '/dashboard/suppliers' ? 'active' : ''}`}>
            <FiUsers className="dock-item-icon" />
            <span className="dock-label">Fornecedores</span>
          </Link>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)} 
            className={`dock-item ${isChatOpen ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <FiMessageSquare className="dock-item-icon" />
            <span className="dock-label">Assistente</span>
          </button>
        </nav>
      </div>

      {/* Floating Toggle Button */}
      <button 
        className={`floating-toggle-btn ${isDockVisible ? '' : 'menu-hidden'}`}
        onClick={() => setIsDockVisible(!isDockVisible)}
        title={isDockVisible ? "Esconder menu" : "Mostrar menu"}
      >
        {isDockVisible ? <FiChevronDown /> : <FiMenu />}
      </button>

      <GeminiChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
