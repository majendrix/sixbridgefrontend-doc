"use client"; // Esto asegura que el componente se ejecute solo en el cliente
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // Importa dynamic para carga dinámica
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";

// Carga dinámica de componentes que podrían acceder a `document`
const Botonera = dynamic(() => import("../../components/Botonera"), {
  ssr: false,
});
const VendedoresForm = dynamic(
  () => import("../../components/VendedoresForm"),
  { ssr: false }
);

const OBTENER_USUARIOS_VENDEDOR = gql`
  query obtenerUsuariosPorRol($role: String!, $limit: Int!, $offset: Int!) {
    obtenerUsuariosPorRol(role: $role, limit: $limit, offset: $offset) {
      id
      nombre
      email
      telefono
      estado
    }
    totalVendedores(role: $role)
  }
`;

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  estado: boolean;
}

const Vendedores = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Número de elementos por página

  // Consulta Apollo
  const { data, loading, error, client } = useQuery(OBTENER_USUARIOS_VENDEDOR, {
    variables: {
      role: "vendedor",
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    },
    fetchPolicy: "network-only",
  });

  const router = useRouter();

  // Resetear el estado al desmontar el componente
  useEffect(() => {
    if (data) {
      // Limpia el cache de Apollo manualmente
      client.cache.evict({ fieldName: "obtenerUsuariosPorRol" });
      client.cache.gc();
    }
  }, [client.cache, data]);

  // Manejo de estados
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error 1: {error.message}</p>;

  console.log("data: ", data);
  console.log("loading: ", loading);
  console.log("error: ", error);

  const totalPages = Math.ceil(data?.totalVendedores / itemsPerPage); // Corregido: totalVendedores en lugar de totalClientesVendedor

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEditarVendedor = (id: string) => {
    router.push(`/vendedores/${id}`);
  };

  const handleVendedorCreado = () => {
    setCurrentPage(1); // Volver a la primera página
  };

  return (
    <div className="wrap">
      <div
        className="modal fade"
        id="addVendedorModal"
        aria-labelledby="addVendedorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addVendedorModalLabel">
                Agregar Nuevo Vendedor
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <VendedoresForm onSuccess={handleVendedorCreado} />
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4 px-1">
              <div className="card-header pb-0">
                <h6>Listado de ventas</h6>
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#addVendedorModal"
                >
                  <i className="fas fa-user-plus"></i> Agregar Vendedor
                </button>
              </div>
              <div className="card-body px-0 pt-0 pb-2">
                <ul className="list-group">
                  {data?.obtenerUsuariosPorRol.map(
                    (vendedor: Usuario, index: number) => (
                      <li
                        key={index}
                        className="list-group-item estado-pendiente border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg"
                      >
                        <div className="d-flex align-items-start col-12">
                          <div className="d-flex">
                            <div>
                              <Image
                                src="/assets/img/team-1.jpg"
                                className="avatar avatar-sm me-3"
                                alt="user1"
                                width={800}
                                height={800}
                              />
                            </div>
                            <div className="d-flex flex-column justify-content-center">
                              <h5 className="mb-0 text-sm text-dark">
                                {vendedor.nombre}
                              </h5>
                              <h6 className="mb-0 text-sm">{vendedor.email}</h6>
                              <p className="text-xs text-secondary mb-0">
                                {vendedor.telefono}
                              </p>
                              <p
                                className={`badge rounded-pill mb-0 mt-2 ${
                                  vendedor.estado ? "bg-primary" : "bg-danger"
                                }`}
                              >
                                {vendedor.estado ? "Activado" : "Desactivado"}
                              </p>
                            </div>
                          </div>
                          <div className="ms-auto text-end">
                            {/* <h5 className="font-weight-bolder">$XX</h5>
                            <p className="text-xs text-secondary mb-0">
                              Ventas de XXX
                            </p> */}
                            <button
                              onClick={() => handleEditarVendedor(vendedor.id)}
                              className="btn mt-2 btn-primary float-end"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  )}
                </ul>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className="page-item">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="page-link btn-primary"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    <li className="page-item me-3 ms-3">
                      <p className="mb-0">
                        Página {currentPage} de {totalPages}
                      </p>
                    </li>
                    <li className="page-item">
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="page-link btn-primary"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <Botonera />
      </div>
    </div>
  );
};
export default Vendedores;
