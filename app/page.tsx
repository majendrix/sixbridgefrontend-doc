"use client";
import React from "react";
import Botonera from "../components/Botonera";
import Pedido from "../components/Pedido";
import Comisiones from "../components/Comisiones";
import { gql, useQuery } from "@apollo/client";

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
const OBTENER_PEDIDOS = gql`
  query obtenerPedidos {
    obtenerPedidos {
      id
      pedido {
        id
        cantidad
      }
      cliente {
        id
        nombre
        email
        direccionnumero
        telefono
      }
      vendedor {
        id
        nombre
        email
        direccionnumero
        telefono
      }
      total
      subtotal
      envio
      estado
      creado
      numeropedido
    }
  }
`;
const OBTENER_PEDIDOS_VENDEDOR = gql`
  query obtenerPedidosVendedor {
    obtenerPedidosVendedor {
      id
      pedido {
        id
        cantidad
      }
      cliente {
        id
        nombre
        email
        direccionnumero
        telefono
      }
      vendedor {
        id
        nombre
        email
        direccionnumero
        telefono
      }
      total
      subtotal
      envio
      estado
      creado
      numeropedido
    }
  }
`;

interface Pedido {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  estado: string;
  total: number;
  subtotal: number;
  envio: number;
  pedido: {
    id: string;
    cantidad: number;
  };
  vendedor: {
    id: string;
    nombre: string;
    email: string;
  };
}

export default function Home() {
  const {
    data: dataUsuario,
    loading: loadingUsuario,
    error: errorUsuario,
  } = useQuery(OBTENER_USUARIO);
  const {
    data: dataPedidoVendedor,
    loading: loadingPedidoVendedor,
    error: errorPedidoVendedor,
  } = useQuery(OBTENER_PEDIDOS_VENDEDOR);
  const { data, loading, error } = useQuery(OBTENER_PEDIDOS);

  if (loadingUsuario) return <p>Cargando Sesión...</p>;
  if (errorUsuario)
    return <p>Error al cargar la sesión: {errorUsuario.message}</p>;
  const { role } = dataUsuario.obtenerUsuario;
  console.log("role: ", role);

  if (loadingPedidoVendedor) return <p>Cargando pedidos vendedor...</p>;
  if (errorPedidoVendedor)
    return (
      <p>
        Error al cargar los pedidos del vendedor: {errorPedidoVendedor.message}
      </p>
    );

  if (loading) return <p>Cargando pedidos Admin...</p>;
  if (error) return <p>Error al cargar los pedidos Admin: {error.message}</p>;

  // Declarar pedidos fuera de los bloques if-else
  let pedidos = [];

  if (role === "administrador") {
    pedidos = [...(data?.obtenerPedidos || [])].sort(
      (a, b) => Number(b.creado) - Number(a.creado)
    );
    console.log("if is admin: ", true);
  } else {
    pedidos = [...(dataPedidoVendedor?.obtenerPedidosVendedor || [])].sort(
      (a, b) => Number(b.creado) - Number(a.creado)
    );
    console.log("if is not admin: ", false);
  }

  // Inicializamos los totales por estado
  const totalesPorEstado = {
    pendientes: 0,
    aprobadas: 0,
    observadas: 0,
    entregadas: 0,
  };

  // Calculamos los totales por estado
  pedidos.forEach((pedido: Pedido) => {
    if (pedido.estado === "Pendiente") {
      totalesPorEstado.pendientes += pedido.total;
    } else if (pedido.estado === "Aprobado") {
      totalesPorEstado.aprobadas += pedido.total;
    } else if (pedido.estado === "Observado") {
      totalesPorEstado.observadas += pedido.total;
    } else if (pedido.estado === "Entregado") {
      totalesPorEstado.entregadas += pedido.total;
    }
  });

  return (
    <div className="main-content position-relative border-radius-lg ">
      <div className="container-fluid position-relative">
        <div className="row mb-4">
          <div className="col-xl-3 col-6 mb-xl-0 mb-4">
            <div className="card bg-danger-subtle border-danger border-1">
              <div className="card-body p-3">
                <div className="row">
                  <div className="col-12">
                    <div className="numbers">
                      <p className="text-sm mb-0 text-uppercase font-weight-bold text-dark">
                        Pendientes
                      </p>
                      <h5 className="font-weight-bolder mb-0">
                        ${totalesPorEstado.pendientes.toLocaleString()}
                      </h5>
                      <p className="text-xxs mb-0 text-dark">
                        Pedidos recien ingresados.
                      </p>
                    </div>
                  </div>
                  <div className="col-3 text-end">
                    <a
                      className="icon icon-shape shadow-primary text-center"
                      href="ventas.html"
                    >
                      <i
                        className="ni ni-bold-right text-lg opacity-10 text-danger"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-6 mb-xl-0 mb-0">
            <div className="card border-primary border-1">
              <div className="card-body p-3">
                <div className="row">
                  <div className="col-12">
                    <div className="numbers">
                      <p className="text-sm mb-0 text-uppercase font-weight-bold text-dark">
                        Aprobados
                      </p>
                      <h5 className="font-weight-bolder mb-0">
                        ${totalesPorEstado.aprobadas.toLocaleString()}
                      </h5>
                      <p className="text-xxs mb-0 text-dark">
                        Pagados, no entregados.
                      </p>
                    </div>
                  </div>
                  <div className="col-3 text-end">
                    <a
                      className="icon icon-shape shadow-primary text-center"
                      href="ventas.html"
                    >
                      <i
                        className="ni ni-bold-right text-lg opacity-10 text-primary"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-6 mb-xl-0 mb-4">
            <div className="card bg-warning-subtle border-warning border-1">
              <div className="card-body p-3">
                <div className="row">
                  <div className="col-12">
                    <div className="numbers">
                      <p className="text-sm mb-0 text-uppercase font-weight-bold text-dark">
                        Observados
                      </p>
                      <h5 className="font-weight-bolder mb-0">
                        ${totalesPorEstado.observadas.toLocaleString()}
                      </h5>
                      <p className="text-xxs mb-0 text-dark">
                        Pedidos con algún problema.
                      </p>
                    </div>
                  </div>
                  <div className="col-3 text-end">
                    <a
                      className="icon icon-shape shadow-primary text-center"
                      href="ventas.html"
                    >
                      <i
                        className="ni ni-bold-right text-lg opacity-10 text-warning"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-6 mb-xl-0 mb-0">
            <div className="card bg-success-subtle border-success border-1">
              <div className="card-body p-3">
                <div className="row">
                  <div className="col-12">
                    <div className="numbers">
                      <p className="text-sm mb-0 text-uppercase font-weight-bold text-dark">
                        Entregados
                      </p>
                      <h5 className="font-weight-bolder mb-0">
                        ${totalesPorEstado.entregadas.toLocaleString()}
                      </h5>
                      <p className="text-xxs mb-0 text-dark">
                        Pedidos listos y entregados.
                        <br />
                        Pago de comisión pendiente.
                      </p>
                    </div>
                  </div>
                  <div className="col-3 text-end">
                    <a
                      className="icon icon-shape shadow-primary text-center"
                      href="ventas.html"
                    >
                      <i
                        className="ni ni-bold-right text-lg opacity-10 text-success"
                        aria-hidden="true"
                      ></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Comisiones />
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header pb-0">
                <h6>Pedidos en proceso</h6>
              </div>
              <div className="card-body px-1 pt-0 pb-2">
                <ul className="list-group">
                  {pedidos.length > 0 ? (
                    pedidos
                      .slice(0, 10)
                      .map((pedido: Pedido) => (
                        <Pedido key={pedido.id} pedido={pedido} />
                      ))
                  ) : (
                    <p>No hay pedidos disponibles.</p>
                  )}
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
