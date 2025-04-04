"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, gql } from "@apollo/client";
const OBTENER_USUARIO = gql`
  query obtenerUsuario {
    obtenerUsuario {
      id
      nombre
      email
      role
    }
  }
`;
const Botonera = () => {
  const { data, loading, error } = useQuery(OBTENER_USUARIO);
  // routing de next
  const pathname = usePathname();
  //console.log(pathname);
  const hiddenPaths = ["/login"];
  if (hiddenPaths.includes(pathname)) {
    return null; // No renderiza el sidebar
  }
  if (loading) return <p>Cargando usuario...</p>;
  if (error)
    return <p>Error al cargar los datos del usuario: {error.message}</p>;
  if (!data?.obtenerUsuario) return null;

  const { role } = data.obtenerUsuario;

  return (
    <section className="footer-buttons bg-primary d-flex py-4 px-4 position-fixed bottom-0 row col-12 col-xl-10 text-white">
      <div className="nav-wrapper position-relative end-0 d-flex">
        {role === "administrador" && (
          <Link
            className="nav-link mb-0 px-0 py-1 d-block align-items-center justify-content-center text-center"
            href="/inventario"
          >
            <i className="bi bi-archive d-block"></i>
            <span className="d-block">Inventario</span>
          </Link>
        )}
        {role === "vendedor" && (
          <Link
            className="nav-link mb-0 px-0 py-1 d-block align-items-center justify-content-center text-center"
            href="/catalogos"
          >
            <i className="bi bi-journal-arrow-down d-block"></i>
            <span className="d-block">Catálogos</span>
          </Link>
        )}

        <Link
          className="nav-link mb-0 px-0 py-1 d-block align-items-center justify-content-center text-center"
          href="/pedidos"
        >
          <i className="bi bi-shop d-block"></i>
          <span className="d-block">Pedidos</span>
        </Link>
        {role === "vendedor" && (
          <Link
            className="nav-link mb-0 px-0 py-1 d-block align-items-center justify-content-center text-center"
            href="/nuevopedido"
          >
            <i className="bi bi-cart-plus d-block"></i>
            <span className="d-block">Nuevo pedido</span>
          </Link>
        )}
      </div>
    </section>
  );
};
export default Botonera;
