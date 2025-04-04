import React from "react";
import MainContent from "../components/MainContent";
import Headerusuario from "../components/Headerusuario";
import type { Metadata } from "next";
//import "bootstrap/dist/css/bootstrap.min.css";
import "./css/variables.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./css/globals.css";
import "./css/sixbridge-dashboard.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoadBootstrap from "../components/LoadBootstrap";
import ApolloProvider from "../components/ApolloProvider";

export const metadata: Metadata = {
  title: "Six Bridge - El puente del ahorro",
  description: "El puente del ahorro",
};

interface RootLayoutProps {
  children: React.ReactNode; // Explicitly define the children prop
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`antialiased g-sidenav-show`}>
        <ApolloProvider>
          <Headerusuario />
          <MainContent>{children}</MainContent>{" "}
          {/* Usamos el nuevo componente */}
          <LoadBootstrap />
        </ApolloProvider>
      </body>
    </html>
  );
}
