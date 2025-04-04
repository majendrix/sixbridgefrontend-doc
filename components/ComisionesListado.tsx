"use client";
import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";

const OBTENER_PEDIDOS = gql`
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
      }
      vendedor {
        id
        nombre
      }
      total
      estado
      creado
      proveedor {
        id
        comision
      }
    }
  }
`;

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
  total: number;
  estado: string;
  creado: string;
  numeropedido: string;
  proveedor: {
    id: string;
    nombre: string;
    email: string;
    codigo: string;
    comision: number;
  };
}

interface ComisionType {
  pedidoId: string;
  comision: number;
}

const ComisionesListado = () => {
  const { data: pedidosData, loading: pedidosLoading, error: pedidosError } = useQuery(OBTENER_PEDIDOS);
  const [comisiones, setComisiones] = useState<ComisionType[]>([]);
  const [totalComisiones, setTotalComisiones] = useState(0);

  useEffect(() => {
    const calcularComisiones = () => {
      if (!pedidosData || !pedidosData.obtenerPedidosVendedor) return;

      const pedidos = pedidosData.obtenerPedidosVendedor;
      const pedidosEntregados = pedidos.filter((pedido: PedidoType) => pedido.estado === "Entregado");

      const comisionesCalculadas: ComisionType[] = pedidosEntregados.map((pedido: PedidoType) => {
        const comision = pedido.proveedor?.comision || 0;
        return { pedidoId: pedido.id, comision: pedido.total * comision };
      });

      setComisiones(comisionesCalculadas);
      const total = comisionesCalculadas.reduce((total: number, { comision }: ComisionType) => total + comision, 0);
      setTotalComisiones(total);
    };

    calcularComisiones();
  }, [pedidosData]);

  if (pedidosLoading) return <p>Cargando comisiones...</p>;
  if (pedidosError) return (
    <div id="comisiones" className="col-12 my-2">
      <div className="card border-info border-1">
        <div className="card-body p-3">
          <p className="mb-0">Error: {pedidosError.message}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div id="comisiones" className="col-12 my-2">
      <div className="card border-info border-1">
        <div className="card-body p-3">
          <h5 className="font-weight-bolder mb-0">
            Comisión total: ${totalComisiones.toLocaleString()}
          </h5>
          <ul className="mt-3">
            {comisiones.map(({ pedidoId, comision }) => (
              <li key={pedidoId}>
                Pedido {pedidoId}: ${comision.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComisionesListado;