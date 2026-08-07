import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import BadgeWidget from "@/modules/carrito/BadgeWidget";
import { useAuth } from "@/modules/seguridad";

function Navbar() {
  const { estaAutenticado, tienePermiso } = useAuth();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    function onChange(e: MediaQueryListEvent) {
      if (e.matches) setIsOpen(false);
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/categories", label: "Categorías" },
    { to: "/orders", label: "Mis órdenes", nowrap: true },
    { to: "/prediccion", label: "Predicción" },
    ...(tienePermiso("productos:crear") || tienePermiso("usuarios:ver")
      ? [{ to: "/admin", label: "Admin" }]
      : []),
  ];

  const linkActivo =
    navLinks
      .filter((link) => {
        if (link.to === "/") return pathname === "/";
        return pathname === link.to || pathname.startsWith(`${link.to}/`);
      })
      .sort((a, b) => b.to.length - a.to.length)[0]?.to ?? null;

  const esActivo = (to: string) => to === linkActivo;

  const claseLink = (to: string, nowrap: boolean, mobile: boolean) =>
    `dark-card text-sm transition-colors ${
      mobile ? "px-4 py-3 min-h-[44px] flex items-center" : "px-4 py-2"
    }${nowrap ? " whitespace-nowrap" : ""}${
      esActivo(to)
        ? " text-cyan-400 border-cyan-400/60 bg-cyan-400/10"
        : " text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50"
    }`;

  const desdeActual = { desde: { pathname } };

  return (
    <nav className="glass-panel border-l-0 border-t-0 border-b border-r-0 px-6 py-4 relative z-50 shadow-none">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-cyan-400">
          Ecommerce
        </Link>

        <div className="hidden md:flex items-center justify-center gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={claseLink(link.to, Boolean(link.nowrap), false)}
            >
              {link.label}
            </Link>
          ))}
          {estaAutenticado ? (
            <Link
              to="/perfil"
              className={`px-4 py-2 text-sm transition-colors ${
                pathname === "/perfil"
                  ? "btn-primary"
                  : "dark-card text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50"
              }`}
            >
              Perfil
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                state={desdeActual}
                className="btn-primary px-4 py-2 text-sm"
              >
                Ingresar
              </Link>
              <Link
                to="/registro"
                className="dark-card px-4 py-2 text-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <BadgeWidget />
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? (
              <svg
                className="w-5 h-5 text-zinc-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-zinc-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-[65px] bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="md:hidden fixed top-[65px] right-0 bottom-0 w-64 glass-panel border-l border-t-0 border-b-0 border-r-0 z-50 flex flex-col gap-1 p-4 animate-slide-in">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={claseLink(link.to, Boolean(link.nowrap), true)}
              >
                {link.label}
              </Link>
            ))}
            {estaAutenticado ? (
              <Link
                to="/perfil"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 text-sm min-h-[44px] flex items-center justify-center transition-colors ${
                  pathname === "/perfil"
                    ? "btn-primary"
                    : "dark-card text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/50"
                }`}
              >
                Perfil
              </Link>
            ) : (
              <div className="flex flex-col gap-1">
                <Link
                  to="/login"
                  state={desdeActual}
                  onClick={() => setIsOpen(false)}
                  className="btn-primary px-4 py-3 text-sm min-h-[44px] flex items-center justify-center"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setIsOpen(false)}
                  className="dark-card px-4 py-3 text-sm min-h-[44px] flex items-center justify-center"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
