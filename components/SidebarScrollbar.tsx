"use client"; // Permite usar hooks en este componente

import { useEffect } from "react";
import Scrollbar from "smooth-scrollbar";

export default function SidebarScrollbar() {
  useEffect(() => {
    // Detectar si el sistema es Windows y si existe el elemento #sidenav-scrollbar
    const win = navigator.platform.indexOf("Win") > -1;

    if (win && document.querySelector("#sidenav-main")) {
      const options = {
        damping: 0.5, // Configuración del scrollbar
      };

      Scrollbar.init(document.querySelector("#sidenav-main") as HTMLElement, options);
    }

    // Limpieza del efecto
    return () => {
      const scrollbarInstance = Scrollbar.get(document.querySelector("#sidenav-main") as HTMLElement);
      if (scrollbarInstance) {
        scrollbarInstance.destroy();
      }
    };
  }, []);

  return null; // Este componente no renderiza nada
}
