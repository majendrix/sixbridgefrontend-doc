"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Chart, registerables } from "chart.js";
import Botonera from "../../components/Botonera";
import Pedido from "../../components/Pedido";
import DownloadPedidosButton from "../../components/DownloadPedidosButton";
import { gql, useQuery } from "@apollo/client";

Chart.register(...registerables);

// Define the Pedido type
interface PedidoType {
  id: string;
  pedido: {
    id: string;
    cantidad: number;
  };
  cliente: {
    id: string;
    nombre: string;
    email: string;
    direccionnumero: string;
  };
  vendedor: {
    id: string;
    nombre: string;
  };
  proveedor: {
    id: string;
    nombre: string;
    codigo: string;
  };
  total: number;
  estado: string;
  creado: string;
  numeropedido: string;
}

const OBTENER_USUARIO = gql`
  query obtenerUsuario {
    obtenerUsuario {
      id
      role
    }
  }
`;

const OBTENER_PEDIDOS = gql`
  query obtenerPedidosVendedorPag(
    $estado: String
    $limit: Int!
    $offset: Int!
  ) {
    obtenerPedidosVendedorPag(estado: $estado, limit: $limit, offset: $offset) {
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
      }
      vendedor {
        id
        nombre
      }
      proveedor {
        id
        nombre
        codigo
      }
      total
      estado
      creado
      numeropedido
    }
    totalPedidosVendedor(estado: $estado)
  }
`;

const Pedidos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [estado, setEstado] = useState("Pendiente");
  const [searchTerm, setSearchTerm] = useState("");
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const {
    data: dataUsuario,
    loading: loadingUsuario,
    error: errorUsuario,
  } = useQuery(OBTENER_USUARIO);

  const { data, loading, error, refetch } = useQuery(OBTENER_PEDIDOS, {
    variables: {
      estado,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    },
  });

  // Sort pedidos by `creado` in descending order (newest first)
  const pedidos: PedidoType[] = useMemo(() => {
    const rawPedidos = data?.obtenerPedidosVendedorPag || [];
    // Create a copy of the array before sorting
    return [...rawPedidos].sort((a, b) => Number(b.creado) - Number(a.creado));
  }, [data]);

  // Filter pedidos based on search term
  const filteredPedidos = useMemo(() => {
    if (!searchTerm) return pedidos;

    const searchLower = searchTerm.toLowerCase();
    return pedidos.filter((pedido) => {
      return (
        pedido.numeropedido.toLowerCase().includes(searchLower) ||
        pedido.cliente.nombre.toLowerCase().includes(searchLower) ||
        pedido.cliente.email.toLowerCase().includes(searchLower) ||
        pedido.vendedor.nombre.toLowerCase().includes(searchLower) ||
        pedido.proveedor.nombre.toLowerCase().includes(searchLower) ||
        pedido.proveedor.codigo.toLowerCase().includes(searchLower)
      );
    });
  }, [pedidos, searchTerm]);

  const totalPedidos = data?.totalPedidosVendedor || 0;

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (filteredPedidos.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const fechas = filteredPedidos.map((pedido) => {
      const timestamp = Number(pedido.creado);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString();
    });

    const totales = filteredPedidos.map((pedido) => pedido.total);

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: fechas,
        datasets: [
          {
            label: "Monto total por pedido",
            data: totales,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Fecha",
            },
          },
          y: {
            title: {
              display: true,
              text: "Monto total ($)",
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [filteredPedidos]);

  useEffect(() => {
    refetch();
  }, [estado, currentPage, refetch]);

  const handleFilterChange = (newEstado: string) => {
    setEstado(newEstado);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalPedidos / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loadingUsuario) return <p>Cargando Sesión...</p>;
  if (errorUsuario)
    return (
      <div className="main-content position-relative border-radius-lg">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12 mb-4">
              <div className="card z-index-2 h-100">
                <div className="card-header pb-0 pt-3 bg-transparent">
                  <p>Error al cargar el usuario: {errorUsuario.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  const { role } = dataUsuario.obtenerUsuario;
  console.log("role: ", role);

  const user = dataUsuario?.obtenerUsuario;
  console.log("user", dataUsuario?.obtenerUsuario);
  console.log("user.role", dataUsuario?.obtenerUsuario.role);

  if (loading) return <p>Cargando pedidos...</p>;
  if (error)
    return (
      <div className="main-content position-relative border-radius-lg">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12 mb-4">
              <div className="card z-index-2 h-100">
                <div className="card-header pb-0 pt-3 bg-transparent">
                  <p>Error al cargar los pedidos: {error.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="main-content position-relative border-radius-lg">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 mb-4">
            <div className="card z-index-2 h-100">
              <div className="card-header pb-0 pt-3 bg-transparent">
                <h6 className="text-capitalize">Resumen de pedidos</h6>
                {user.role === "administrador" && <DownloadPedidosButton />}
              </div>
              <div className="card-body p-3">
                <div className="chart">
                  <canvas
                    ref={chartRef}
                    id="chart-line"
                    className="chart-canvas"
                    height="300"
                  ></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <FiltrosPedidos estado={estado} onFilterChange={handleFilterChange} />
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header pb-0">
                <h6>Listado de ventas</h6>
                {/* Add search field */}
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar pedido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="card-body px-0 pt-0 pb-2">
                <ul className="list-group">
                  {filteredPedidos.length > 0 ? (
                    filteredPedidos.map((pedido: PedidoType) => (
                      <Pedido key={pedido.id} pedido={pedido} />
                    ))
                  ) : (
                    <p>No hay pedidos disponibles.</p>
                  )}
                </ul>
                <Paginacion
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalPedidos / itemsPerPage)}
                  onNextPage={handleNextPage}
                  onPreviousPage={handlePreviousPage}
                />
              </div>
            </div>
          </div>
        </div>
        <Botonera />
      </div>
    </div>
  );
};

const FiltrosPedidos = ({
  estado,
  onFilterChange,
}: {
  estado: string;
  onFilterChange: (newEstado: string) => void;
}) => (
  <div className="btn-scroll">
    <div
      className="btn-group"
      role="group"
      aria-label="Basic checkbox toggle button group"
    >
      {[
        { id: "Pendiente", label: "Pendientes" },
        { id: "Aprobado", label: "Aprobadas" },
        { id: "Observado", label: "Observadas" },
        { id: "Entregado", label: "Entregadas" },
      ].map((filtro) => (
        <React.Fragment key={filtro.id}>
          <input
            type="radio"
            className="btn-check"
            id={`btnFiltro${filtro.id}`}
            name="estado"
            checked={estado === filtro.id}
            onChange={() => onFilterChange(filtro.id)}
          />
          <label
            className="btn btn-primary ms-0 me-0"
            htmlFor={`btnFiltro${filtro.id}`}
          >
            {filtro.label}
          </label>
        </React.Fragment>
      ))}
    </div>
  </div>
);

const Paginacion = ({
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
}: {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}) => (
  <nav aria-label="Page navigation">
    <ul className="pagination justify-content-center">
      <li className="page-item">
        <button
          className="page-link"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
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
          className="page-link"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </li>
    </ul>
  </nav>
);

export default Pedidos;
