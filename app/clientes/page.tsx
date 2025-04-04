"use client"; // Esto asegura que Formik se ejecute solo en el cliente
import React, { useState } from "react";
import Botonera from "../../components/Botonera";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";

const OBTENER_CLIENTES_USUARIO = gql`
  query obtenerClientes($limit: Int!, $offset: Int!) {
    obtenerClientes(limit: $limit, offset: $offset) {
      id
      nombre
      email
      telefono
      vendedor {
        id
      }
    }
    totalClientesVendedorTodos
  }
`;

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

const Clientes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Number of items per page

  // Consulta Apollo
  const { data, loading, error } = useQuery(OBTENER_CLIENTES_USUARIO, {
    variables: {
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    },
  });
  const router = useRouter();

  // Manejo de estados
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error 1: {error.message}</p>;

  console.log("data: ", data);
  console.log("loading: ", loading);
  console.log("error: ", error);

  const handleEditarCliente = (id: string) => {
    router.push(`/clientes/${id}`);
  };

  const totalPages = Math.ceil(data?.totalClientesVendedorTodos / itemsPerPage);

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

  return (
    <div className="wrap">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4 px-1">
              <div className="card-header pb-0">
                <h6>Listado de clientes</h6>
              </div>
              <div className="card-body px-0 pt-0 pb-2">
                {data?.obtenerClientes.length > 0 ? (
                  // If there are clients, render the list
                  <ul className="list-group">
                    {data.obtenerClientes.map(
                      (cliente: Cliente, index: React.Key) => (
                        <li
                          key={index}
                          className="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg"
                        >
                          <div className="d-flex flex-column col-7">
                            <h5 className="mb-0 text-sm text-dark">
                              {cliente.nombre}
                            </h5>
                            <h6 className="mb-0 text-sm">{cliente.email}</h6>
                            <p className="text-xs text-secondary mb-0">
                              {cliente.telefono}
                            </p>
                          </div>
                          <div className="col-5">
                            <button
                              onClick={() => handleEditarCliente(cliente.id)}
                              className="btn mt-2 btn-primary float-end"
                            >
                              Editar
                            </button>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  // If there are no clients, display a message
                  <div className="text-center py-4">
                    <p className="text-muted">
                      Aún no tienes clientes registrados.
                    </p>
                  </div>
                )}

                {/* Pagination */}
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

export default Clientes;
