import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, MessageCircle, Phone, X } from 'lucide-react';
import { supabase, waLink } from '../lib/supabase';

const links = [['/catalogo', 'Catalogo'], ['/promozioni', 'Promozioni'], ['/chi-siamo', 'Chi siamo'], ['/contatti', 'Contatti']] as const;

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-navy text-white shadow-lg">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
          <Link to="/" className="font-display text-xl tracking-wide">DIGI <span className="text-gold">HOUSE</span></Link>
          <nav className="hidden md:flex gap-8" aria-label="Principale">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `text-sm font-medium transition hover:text-gold ${isActive ? 'text-gold' : ''}`}>{label}</NavLink>))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:+390833186089" className="hidden sm:flex items-center gap-2 text-sm hover:text-gold" aria-label="Chiama"><Phone size={16} />0833 186 0089</a>
            <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
          </div>
        </div>
        {open && (
          <nav className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-3" aria-label="Mobile">
            {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className="py-1">{label}</NavLink>)}
          </nav>)}
      </header>
      {!supabase && (
        <div role="status" className="bg-gold-100 text-navy text-sm text-center py-2 px-4">
          Catalogo in attesa di configurazione: collegare Supabase (vedi README).
        </div>)}
      <main className="flex-1"><Outlet /></main>
      <a href={waLink('Buongiorno, vorrei informazioni sui vostri prodotti.')} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 shadow-xl transition hover:scale-105" aria-label="Scrivici su WhatsApp">
        <MessageCircle size={20} /><span className="hidden sm:inline text-sm font-semibold">WhatsApp</span>
      </a>
      <footer className="bg-navy text-white/80 text-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 grid gap-2 md:grid-cols-2">
          <p><strong className="text-white">DIGI HOUSE SRL</strong><br />Zona Industriale Casarano, Lotto 10, Tronco A, Casarano (LE)</p>
          <p className="md:text-right">Tel. +39 0833 186 0089 · WhatsApp +39 328 309 9390<br />degihousesrl@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
