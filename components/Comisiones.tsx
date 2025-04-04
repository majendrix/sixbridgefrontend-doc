"use client";
import React, { useEffect, useState } from "react";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import { PedidoType } from "../types/types";

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
      }
      proveedor {
        id
      }
      total
      estado
      creado
      numeropedido
      comisionPagada
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
      proveedor {
        id
      }
      total
      estado
      creado
      numeropedido
      comisionPagada
    }
  }
`;

const OBTENER_PROVEEDOR = gql`
  query obtenerProveedor($id: ID!) {
    obtenerProveedor(id: $id) {
      id
      comision
    }
  }
`;

const Comisiones = () => {
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
  const {
    data: pedidosData,
    loading: pedidosLoading,
    error: pedidosError,
  } = useQuery(OBTENER_PEDIDOS);
  const [obtenerProveedor, { loading: proveedorLoading }] = useLazyQuery(
    OBTENER_PROVEEDOR
  );
  const [totalComisiones, setTotalComisiones] = useState(0);

  useEffect(() => {
    const calcularComisiones = async () => {
      // Check for loading and errors
      if (proveedorLoading) {
        console.log("proveedorLoading:", proveedorLoading);
        return;
      }
      if (loadingUsuario || loadingPedidoVendedor || pedidosLoading) {
        return;
      }

      if (errorUsuario) {
        console.error("Error fetching data (errorUsuario):", errorUsuario);
        return;
      }
      if (errorPedidoVendedor) {
        console.error(
          "Error fetching data (errorPedidoVendedor):",
          errorPedidoVendedor
        );
        return;
      }
      if (pedidosError) {
        console.error("Error fetching data (pedidosError):", pedidosError);
        return;
      }

      // Get the user role
      const role = dataUsuario?.obtenerUsuario?.role;
      if (!role) {
        console.error("No user role found.");
        return;
      }

      // Fetch the correct pedidos based on the role
      let pedidos = [];
      if (role === "administrador") {
        pedidos = pedidosData?.obtenerPedidos || [];
      } else if (role === "vendedor") {
        pedidos = dataPedidoVendedor?.obtenerPedidosVendedor || [];
      }

      console.log("Pedidos fetched:", pedidos);

      // Filter pedidos that are "Entregado" and have comisionPagada === false
      const pedidosEntregados = pedidos.filter(
        (pedido: PedidoType) =>
          pedido.estado === "Entregado" && !pedido.comisionPagada
      );

      console.log("Pedidos entregados:", pedidosEntregados);

      try {
        // Calculate comisiones
        const comisiones = await Promise.all(
          pedidosEntregados.map(async (pedido: PedidoType) => {
            if (!pedido.proveedor?.id) {
              console.warn("Proveedor ID missing for pedido:", pedido.id);
              return 0;
            }
            const { data, error } = await obtenerProveedor({
              variables: { id: pedido.proveedor.id },
            });
            if (error) {
              console.error("Error fetching proveedor:", error);
              return 0;
            }
            const comision = data?.obtenerProveedor?.comision || 0;
            return pedido.total * comision;
          })
        );

        // Sum up the comisiones
        const total = comisiones.reduce(
          (total, comision) => total + comision,
          0
        );
        setTotalComisiones(total);
      } catch (error) {
        console.error("Error calculating comisiones:", error);
      }
    };

    calcularComisiones();
  }, [
    dataUsuario?.obtenerUsuario?.role,
    pedidosData,
    dataPedidoVendedor,
    loadingUsuario,
    loadingPedidoVendedor,
    pedidosLoading,
    errorUsuario,
    errorPedidoVendedor,
    pedidosError,
    obtenerProveedor,
    proveedorLoading,
  ]);

  if (loadingUsuario || loadingPedidoVendedor || pedidosLoading) {
    return <p>Cargando...</p>;
  }

  if (errorUsuario || errorPedidoVendedor || pedidosError) {
    return (
      <div id="comisiones" className="col-12 my-2">
        <div className="card border-info border-1">
          <div className="card-body p-3">
            <p className="mb-0">
              Error:{" "}
              {errorUsuario?.message ||
                errorPedidoVendedor?.message ||
                pedidosError?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="comisiones" className="col-12 my-2">
      <div className="card border-info border-1">
        <div className="card-body p-3">
          <h5 className="font-weight-bolder mb-0">
            Comisión total: ${totalComisiones.toLocaleString()}
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Comisiones;
