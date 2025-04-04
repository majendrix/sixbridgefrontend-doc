"use client"; // Este archivo es un componente cliente

import { useEffect } from "react";

export default function LoadBootstrap() {
  useEffect(() => {
    // Importa el JavaScript de Bootstrap dinámicamente
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
    // Cargar scripts desde la carpeta "public"
    const loadScript = (src: string) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    };

    // Cargar los scripts desde la carpeta "public"
    loadScript("/assets/js/core/popper.min.js");
    loadScript("/assets/js/argon-dashboard.min.js?v=2.1.0");
  }, []);

  return null; // Este componente no renderiza nada
}
