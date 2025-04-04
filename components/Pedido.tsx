"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
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

const Pedido = ({ pedido }) => {
  const {
    id,
    cliente,
    total,
    subtotal,
    envio,
    estado,
    creado,
    numeropedido,
    vendedor,
  } = pedido;
  const { data, loading, error } = useQuery(OBTENER_USUARIO);
  const router = useRouter();

  const estadoClase = {
    Pendiente: "text-danger",
    Aprobado: "text-primary",
    Observado: "text-warning",
    Entregado: "text-success",
  };

  const handleEditarPedido = (id: string) => {
    router.push(`/pedidos/${id}`);
  };

  const handleVerPedido = (id: string) => {
    router.push(`/verpedido/${id}`);
  };

  const claseEstado = estadoClase[estado] || "text-danger"; // Clase predeterminada

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error al obtener usuario: {error.message}</p>;

  if (!data?.obtenerUsuario) return null;

  const { role } = data.obtenerUsuario;

  let fechaFormateada = "Fecha inválida";
  if (creado) {
    let timestamp = Number(creado);
    // Si el timestamp tiene más de 12 dígitos, es milisegundos
    if (timestamp.toString().length > 12) {
      timestamp = Math.floor(timestamp / 1000); // Convertir a segundos
    }

    const fecha = new Date(timestamp * 1000); // Crear la fecha con milisegundos
    if (!isNaN(fecha.getTime())) {
      fechaFormateada = new Intl.DateTimeFormat("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(fecha);
    }
  }

  return (
    <li className="list-group-item estado-pendiente border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg align-items-start">
      <div className="d-flex">
        <div className="d-flex flex-column justify-content-center border-end pe-4">
          <h5 className="mb-0 text-sm text-dark">
            N pedido <span>{numeropedido}</span>
          </h5>
          <h6 className={`mb-0 text-sm ${claseEstado}`}>{estado}</h6>
          <p className="text-xs text-secondary mb-1">{cliente.nombre}</p>
          <p className="text-xs text-secondary mb-1">
            <Link href="mailto:{cliente.email}"> {cliente.email}</Link>
          </p>
          <p className="text-xs text-secondary mb-2">
            <Link href="phone:{cliente.telefono}">
              Fono: {cliente.telefono}
            </Link>
          </p>
          {role === "administrador" && (
            <p className="text-xs text-secondary mb-1">{vendedor.nombre}</p>
          )}
          {role === "administrador" && (
            <p className="text-xs text-secondary mb-0">
              <Link href="phone:{vendedor.telefono}">
                Fono: {vendedor.telefono}
              </Link>
            </p>
          )}
        </div>
      </div>
      <div className="ms-auto text-end">
        <h5 className="font-weight-bolder mb-0">
          Total: ${total.toLocaleString()}
        </h5>
        <p className="mb-0">
          <strong className="font-weight-bolder mb-0">
            Subtotal: ${subtotal}
          </strong>
        </p>
        <p className="mb-0">
          <strong className="font-weight-bolder mb-0">Envío: ${envio}</strong>
        </p>
        <p className="text-xs text-secondary mb-0">{fechaFormateada}</p>
        {role === "administrador" && (
          <button
            onClick={() => handleEditarPedido(id)}
            className="btn mt-2 btn-primary"
          >
            Editar
          </button>
        )}
        {role === "vendedor" && (
          <button
            onClick={() => handleVerPedido(id)}
            className="btn mt-2 btn-primary"
          >
            Ver detalle
          </button>
        )}
      </div>
    </li>
  );
};
export default Pedido;
