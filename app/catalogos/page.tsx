"use client";
import React, { useState } from "react"; // Import useState for the toggle feature
import Link from "next/link";
import Botonera from "../../components/Botonera";
import { gql, useQuery } from "@apollo/client";

const OBTENER_USUARIO = gql`
  query obtenerUsuario {
    obtenerUsuario {
      id
      role
    }
  }
`;

const OBTENER_PROVEEDORES = gql`
  query obtenerProveedores {
    obtenerProveedores {
      id
      nombre
      rut
      codigo
      telefono
      direccioncalle
      estado # Include estado in the query
    }
  }
`;

interface Proveedor {
  id: string;
  nombre: string;
  rut: string;
  codigo: string;
  telefono: string;
  direccioncalle: string;
  estado: boolean; // Add estado to the interface
  email?: string; // Optional, since it's not in the query but used in the JSX
}

export const dynamic = "force-dynamic";

export default function Catalogos() {
  const { data, loading, error } = useQuery(OBTENER_PROVEEDORES);
  const {
    data: dataUsuario,
    loading: loadingUsuario,
    error: errorUsuario,
  } = useQuery(OBTENER_USUARIO);
  const [showInactive, setShowInactive] = useState(false); // State to toggle inactive providers

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Filter providers based on estado and the showInactive state
  const proveedores: Proveedor[] =
    data?.obtenerProveedores.filter(
      (proveedor: Proveedor) => showInactive || proveedor.estado
    ) || [];

  if (loadingUsuario) return <p>Cargando usuario...</p>;
  if (errorUsuario)
    return <p>Error al cargar los datos del usuario: {errorUsuario.message}</p>;
  if (!dataUsuario?.obtenerUsuario) return null;

  const { role } = dataUsuario.obtenerUsuario;

  return (
    <div className="wrap min-vh-100">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4 px-1">
              <div className="card-header pb-0">
                <h6>Catalogos por proveedor</h6>
                {role === "administrador" && (
                  <button
                    onClick={() => setShowInactive(!showInactive)}
                    className="btn btn-secondary btn-sm"
                  >
                    {showInactive ? "Ocultar Inactivos" : "Mostrar Inactivos"}
                  </button>
                )}
              </div>
              <div className="card-body px-0 pt-0 pb-2">
                <ul className="list-group">
                  {proveedores.map((proveedor: Proveedor, index: number) => (
                    <li
                      key={index}
                      className={`list-group-item border-0 d-flex mb-2 ${
                        proveedor.estado ? "bg-gray-100" : "bg-gray-300"
                      } border-radius-lg`}
                    >
                      <Link
                        href={`/catalogos/${proveedor.codigo}`}
                        className="d-block col-12 p-4"
                      >
                        <div className="d-flex flex-column">
                          <h5 className="mb-0 text-sm text-dark">
                            {proveedor.nombre}
                          </h5>
                          <h6 className="mb-0 text-sm">{proveedor.email}</h6>
                          <p className="text-xs text-secondary mb-0">
                            RUT: {proveedor.rut}
                          </p>
                          <p className="text-xs text-secondary mb-0">
                            FONO: {proveedor.telefono}
                          </p>
                          <p className="text-xs text-secondary mb-0">
                            CODIGO: {proveedor.codigo}
                          </p>
                          <p className="text-xs text-secondary mb-0">
                            ESTADO: {proveedor.estado ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Botonera />
      </div>
    </div>
  );
}
