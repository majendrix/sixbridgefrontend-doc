"use client";
import React, { use } from "react";
import { notFound } from "next/navigation";
import { useQuery, useMutation, gql } from "@apollo/client";
import Swal from "sweetalert2";

const OBTENER_VENDEDOR = gql`
  query obtenerVendedor($id: ID!) {
    obtenerVendedor(id: $id) {
      id
      nombre
      comisionHistory {
        pedidoId
        fecha
        monto
        pagadoPor
      }
    }
  }
`;

const OBTENER_PEDIDOS_ENTREGADOS = gql`
  query obtenerPedidosEntregados($vendedorId: ID!) {
    obtenerPedidosEntregados(vendedorId: $vendedorId) {
      id
      numeropedido
      estado
      vendedor {
        id
        nombre
      }
      comisionPagada
      total
    }
  }
`;

const MARCAR_COMISION_PAGADA = gql`
  mutation marcarComisionPagada($id: ID!) {
    marcarComisionPagada(id: $id) {
      id
      comisionPagada
    }
  }
`;

const AGREGAR_COMISION_HISTORY = gql`
  mutation agregarComisionHistory(
    $vendedorId: ID!
    $input: ComisionHistoryInput!
  ) {
    agregarComisionHistory(vendedorId: $vendedorId, input: $input) {
      id
      comisionHistory {
        pedidoId
        fecha
        monto
        pagadoPor
      }
    }
  }
`;

type paramsType = Promise<{ id: string }>;

const EditarVendedorComisiones = (props: { params: paramsType }) => {
  const params = use(props.params);
  const vendedorId = params.id;

  // Si no encontramos el clienteId, mostramos un 404
  if (!vendedorId) {
    notFound(); // Esto maneja el error mostrando una página 404
  }
  console.log("Vendedor id: ", vendedorId);

  // Fetch the vendedor data
  const {
    data: vendedorData,
    loading: vendedorLoading,
    error: vendedorError,
  } = useQuery(OBTENER_VENDEDOR, {
    variables: { id: vendedorId }, // Use `id` instead of `vendedorId`
  });

  // Fetch the pedidos with estado "Entregado"
  const {
    data: pedidosData,
    loading: pedidosLoading,
    error: pedidosError,
  } = useQuery(OBTENER_PEDIDOS_ENTREGADOS, {
    variables: { vendedorId }, // Pass the vendedorId variable
  });

  // Mutation to mark a pedido's commission as paid
  const [marcarComisionPagada] = useMutation(MARCAR_COMISION_PAGADA, {
    refetchQueries: [
      { query: OBTENER_PEDIDOS_ENTREGADOS, variables: { vendedorId } },
    ],
  });

  // Mutation to add a commission payment to the Vendedor's history
  const [agregarComisionHistory] = useMutation(AGREGAR_COMISION_HISTORY, {
    refetchQueries: [
      { query: OBTENER_VENDEDOR, variables: { id: vendedorId } },
    ], // Use `id` instead of `vendedorId`
  });

  // Handle marking a commission as paid
  const handleMarkAsPaid = async (pedidoId, vendedorId, monto, pagadoPor) => {
    try {
      // Mark the pedido's commission as paid
      await marcarComisionPagada({ variables: { id: pedidoId } });

      // Add the payment to the Vendedor's comisionHistory
      await agregarComisionHistory({
        variables: {
          vendedorId,
          input: {
            pedidoId,
            monto,
            pagadoPor,
          },
        },
      });

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Comisión marcada como pagada",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al marcar la comisión como pagada",
        confirmButtonText: "Aceptar",
      });
    }
  };

  if (vendedorLoading || pedidosLoading) return <p>Cargando...</p>;
  if (vendedorError) return <p>Error vendedor: {vendedorError.message}</p>;
  if (pedidosError) return <p>Error pedidos: {pedidosError.message}</p>;

  const vendedor = vendedorData.obtenerVendedor;
  const pedidosEntregados = pedidosData.obtenerPedidosEntregados;

  return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 mb-4">
            <div className="card z-index-2 h-100 p-3">
              <h1>Vendedor: {vendedor.nombre}</h1>
              <h2>Comisiones</h2>
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>
                      Comisión
                      <br />
                      Pagada
                    </th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosEntregados.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>{pedido.numeropedido}</td>
                      <td>{pedido.comisionPagada ? "Sí" : "No"}</td>
                      <td>{pedido.total}</td>
                      <td>
                        {!pedido.comisionPagada && (
                          <button
                            className="btn btn-primary"
                            onClick={
                              () =>
                                handleMarkAsPaid(
                                  pedido.id,
                                  vendedor.id,
                                  100,
                                  "Admin"
                                ) // Replace with dynamic values
                            }
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
};

export default EditarVendedorComisiones;
