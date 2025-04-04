// app/components/MainContent.tsx
"use client"; // Marcar como Client Component

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Obtenemos la ruta actual
  const isLoginPage = pathname === "/login"; // Verificamos si estamos en la página de login

  return (
    <section className="bk-gradiant-01">
      <div className="container-fluid">
        <div className="row">
          {!isLoginPage && <Sidebar />}{" "}
          {/* Mostrar Sidebar solo si no estamos en la página de login */}
          <main
            className={`main-content position-relative border-radius-lg min-vh-100 p-0 ${
              !isLoginPage ? "col-lg-10 offset-lg-2 pt-lg-4" : "col-12"
            }`}
          >
            {children}
            <Footer />
          </main>
        </div>
      </div>
    </section>
  );
}
