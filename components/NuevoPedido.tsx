"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ModalClienteNuevo from "../components/ModalClienteNuevo";
import AsignarCliente from "./pedidos/AsignarClientePedido";
import AsignarProveedor from "./pedidos/AsignarProveedorPedido";
import ModalProductosSelect from "../components/ModalProductosSelect";
import { useMutation, useQuery, gql } from "@apollo/client";
import Swal from "sweetalert2";
import Image from "next/image";
import { Producto } from "../types/types";

// Define the Cliente type
export interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  direccioncalle: string;
  direccionnumero: string;
  telefono: string;
  email: string;
}

// Define the Proveedor type
export interface Proveedor {
  id: string;
  nombre: string;
  codigo: string; // Add other fields as needed
}

// Queries y Mutations
const OBTENER_USUARIO = gql`
  query obtenerUsuario {
    obtenerUsuario {
      id
    }
  }
`;

const OBTENER_RANGOS_ENVIO = gql`
  query obtenerCostoEnvio {
    obtenerCostoEnvio {
      id
      minTotal
      maxTotal
      costo
    }
  }
`;

const CREAR_PEDIDO = gql`
  mutation nuevoPedido($input: PedidoInput) {
    nuevoPedido(input: $input) {
      id
      pedido {
        id
        cantidad
      }
      cliente {
        id
        nombre
      }
      proveedor {
        id
        nombre
      }
      vendedor {
        id
        nombre
      }
      total
      subtotal
      estado
      envio
      numeropedido
    }
  }
`;

const NuevoPedido = () => {
  const router = useRouter();
  const [
    clienteSeleccionado,
    setClienteSeleccionado,
  ] = useState<Cliente | null>(null);
  const [
    proveedorSeleccionado,
    setProveedorSeleccionado,
  ] = useState<Proveedor | null>(null);
  const [proveedorSKU, setProveedorSKU] = useState<string | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [envio, setEnvio] = useState(0);
  const [mensaje, guardarMensaje] = useState<string | null>(null);

  // Fetch user data
  const { data, loading: userLoading, error: userError } = useQuery(
    OBTENER_USUARIO
  );

  // Fetch delivery cost ranges
  const {
    data: deliveryData,
    loading: deliveryLoading,
    error: deliveryError,
  } = useQuery(OBTENER_RANGOS_ENVIO);

  // Mutation to create a new order
  const [crearPedido] = useMutation(CREAR_PEDIDO);

  // Calculate subtotal
  const calcularSubtotal = useCallback(() => {
    return productos.reduce((acc, producto) => acc + producto.subtotal, 0);
  }, [productos]);

  // Calculate delivery cost
  const calcularCostoEnvio = useCallback(
    (purchaseTotal: number) => {
      if (
        deliveryLoading ||
        deliveryError ||
        !deliveryData?.obtenerCostoEnvio
      ) {
        console.log("Delivery data not available or still loading.");
        return 0; // Default to 0 if data is not available
      }

      const ranges = deliveryData.obtenerCostoEnvio;
      console.log("Ranges:", ranges);
      console.log("Purchase Total:", purchaseTotal);

      const matchingRange = ranges.find(
        (range) =>
          purchaseTotal >= range.minTotal && purchaseTotal <= range.maxTotal
      );

      console.log("Matching Range:", matchingRange);

      return matchingRange ? matchingRange.costo : 0;
    },
    [deliveryLoading, deliveryError, deliveryData]
  );

  // Calculate total
  const calcularTotal = useCallback(() => {
    return calcularSubtotal() + (envio || 0);
  }, [calcularSubtotal, envio]);

  // Update delivery cost when productos or deliveryData changes
  useEffect(() => {
    const subtotal = calcularSubtotal();
    const costoEnvio = calcularCostoEnvio(subtotal);
    const total = calcularTotal();
    console.log("Subtotal:", subtotal);
    console.log("Costo de envío:", costoEnvio);
    console.log("Total:", total);

    if (isNaN(subtotal)) {
      console.error("Subtotal is NaN. Check productos:", productos);
      return;
    }

    if (isNaN(costoEnvio)) {
      console.error(
        "Costo de envío is NaN. Check deliveryCostRanges:",
        deliveryData
      );
      return;
    }

    if (isNaN(total)) {
      console.error("Total is NaN. Check subtotal and envio:", subtotal, envio);
      return;
    }

    setEnvio(costoEnvio);
  }, [
    productos,
    deliveryData,
    calcularSubtotal,
    calcularCostoEnvio,
    calcularTotal,
    envio,
  ]);

  // Handle cliente selection
  const handleClienteSeleccionado = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
  };

  // Handle proveedor selection
  const handleProveedorSeleccionado = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setProveedorSKU(proveedor.codigo);
  };

  // Add productos to the order
  const agregarProductos = (productosSeleccionados: Producto[]) => {
    const nuevosProductos = productosSeleccionados.map((producto) => ({
      ...producto,
      cantidad: 1,
      subtotal: producto.precio,
    }));
    setProductos((prevProductos) => [...prevProductos, ...nuevosProductos]);
  };

  // Remove producto from the order
  const eliminarProducto = (id: string) => {
    setProductos((prevProductos) => prevProductos.filter((p) => p.id !== id));
  };

  // Update producto quantity
  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    setProductos((prevProductos) =>
      prevProductos.map((producto) =>
        producto.id === id
          ? {
              ...producto,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * producto.precio,
            }
          : producto
      )
    );
  };

  // Handle order creation
  const handleCrearPedido = async () => {
    if (!clienteSeleccionado) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor selecciona un cliente",
      });
      return;
    }

    if (!proveedorSeleccionado) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor selecciona un proveedor",
      });
      return;
    }

    if (productos.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor selecciona al menos un producto",
      });
      return;
    }

    const input = {
      cliente: clienteSeleccionado.id,
      proveedor: proveedorSeleccionado.id,
      pedido: productos.map((producto) => ({
        id: producto.id,
        cantidad: producto.cantidad,
      })),
      subtotal: calcularSubtotal(),
      total: calcularTotal(),
      envio,
    };

    try {
      await crearPedido({
        variables: { input },
      });
      router.push("/");
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Pedido creado exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        guardarMensaje(error.message);
      } else {
        guardarMensaje("Ocurrió un error inesperado");
      }
      console.log("error al crear pedido: ", error.message);
      console.error("error al crear pedido: ", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al crear el pedido",
      });
      setTimeout(() => {
        guardarMensaje(null);
      }, 3000);
    }
  };

  // Confirm order
  const confirmarPedido = () => {
    Swal.fire({
      title: "Confirmar Pedido",
      html: `
        <p>¿Estás seguro de que deseas confirmar el pedido?</p>
        <p><strong>Total:</strong> $${calcularTotal()}</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        handleCrearPedido();
      }
    });
  };

  // Display error message
  const mostrarMensaje = () => {
    return (
      <div className="mt-3 text-warning">
        <p>{mensaje}</p>
      </div>
    );
  };

  // Loading and error handling
  if (userLoading || deliveryLoading) return <p>Cargando...</p>;
  if (userError) return <p>Error al obtener usuario: {userError.message}</p>;
  if (deliveryError)
    return <p>Error al obtener rangos de envío: {deliveryError.message}</p>;

  const usuario = data?.obtenerUsuario;

  if (!usuario) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo obtener la información del usuario",
    });
    return null;
  }

  return (
    <main className="main-content position-relative border-radius-lg ">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 mb-4">
            <ModalClienteNuevo />
            <ModalProductosSelect
              skuproveedor={proveedorSKU || ""}
              onSeleccionar={agregarProductos}
            />
            <div className="card z-index-2 h-100">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    {mensaje && mostrarMensaje()}
                    <h3 className="text-capitalize">Nuevo pedido</h3>
                    <AsignarCliente
                      onClienteSeleccionado={handleClienteSeleccionado}
                    />
                    {clienteSeleccionado && (
                      <div id="cliente" className="col-6 mb-4 text-sm col-12">
                        <p className="mb-0">
                          <strong>{clienteSeleccionado.nombre}</strong>
                        </p>
                        <p className="mb-0">{clienteSeleccionado.rut}</p>
                        <p className="mb-0">
                          {clienteSeleccionado.direccioncalle}{" "}
                          {clienteSeleccionado.direccionnumero}
                        </p>
                        <p className="mb-0">{clienteSeleccionado.telefono}</p>
                        <p className="mb-0">{clienteSeleccionado.email}</p>
                      </div>
                    )}
                    <button
                      id="addClientBtn"
                      className="btn btn-icon btn-primary"
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#addClientModal"
                    >
                      <span className="btn-inner--text">Nuevo Cliente</span>
                      <span className="btn-inner--icon ms-2">
                        <i className="bi bi-person-square"></i>
                      </span>
                    </button>
                    <AsignarProveedor
                      onProveedorSeleccionado={handleProveedorSeleccionado}
                    />
                    <h4 className="text-capitalize">Productos</h4>
                    <ul className="list-group listado-productos">
                      {productos.map((producto) => (
                        <li
                          key={producto.id}
                          className="list-group-item border-0 d-flex flex-column flex-md-row justify-content-between align-items-center p-4 mb-2 bg-gray-100 border-radius-lg"
                        >
                          <div className="d-flex align-items-stretch col-12 col-md-6">
                            <button
                              type="button"
                              className="btn btn-eliminar-producto btn-danger btn-close position-absolute top-0 end-0 text-primary"
                              onClick={() => eliminarProducto(producto.id)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                            <div className="d-flex align-items-stretch col-8">
                              <Image
                                src={`/productos/${producto.skuproveedor}/${producto.sku}.jpg`}
                                className="avatar avatar-lg me-3"
                                alt={`Producto ${producto.nombre}`}
                                width={800}
                                height={800}
                              />
                              <div>
                                <h5 className="mb-0 text-sm text-dark">
                                  SKU <span>{producto.sku}</span>
                                </h5>
                                <h6 className="mb-0 text-sm text-danger">
                                  {producto.nombre}
                                </h6>
                                <p className="text-xs text-secondary mb-0">
                                  {producto.descripcion}
                                </p>
                                <p className="text-xs text-secondary mb-0">
                                  Formato: {producto.formato}
                                </p>
                              </div>
                            </div>
                            <div className="text-end ms-md-auto me-md-4 col-4">
                              <h5 className="font-weight-bolder product-price mb-1">
                                ${producto.precio.toLocaleString()}
                              </h5>
                              <p className="text-xs text-secondary mb-0">
                                Stock: {producto.existencia}
                              </p>
                            </div>
                          </div>
                          <div className="row">
                            <div className="mt-3 mt-md-0 col-12 col-md-6">
                              <div className="d-flex align-items-center mt-3">
                                <button
                                  className="btn btn-outline-secondary decrease-btn"
                                  type="button"
                                  aria-label="Disminuir cantidad"
                                  onClick={() =>
                                    actualizarCantidad(
                                      producto.id,
                                      Math.max(1, producto.cantidad - 1)
                                    )
                                  }
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  className="form-control text-center mx-2 quantity-input mb-3"
                                  value={producto.cantidad}
                                  min="1"
                                  style={{ width: "70px" }}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) =>
                                    actualizarCantidad(
                                      producto.id,
                                      Math.max(1, parseInt(e.target.value) || 1)
                                    )
                                  }
                                />
                                <button
                                  className="btn btn-outline-secondary increase-btn"
                                  type="button"
                                  aria-label="Aumentar cantidad"
                                  onClick={() =>
                                    actualizarCantidad(
                                      producto.id,
                                      producto.cantidad + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="text-end mt-2 col-12 col-12">
                              <p className="mb-0 text-sm font-weight-bold">
                                Subtotal:{" "}
                                <span className="product-subtotal">
                                  ${producto.subtotal.toLocaleString()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button
                      id="openModalProductos"
                      className="btn btn-icon btn-primary mt-4"
                      data-bs-toggle="modal"
                      data-bs-target="#productModal"
                    >
                      <span className="btn-inner--text">Agregar producto</span>
                      <span className="btn-inner--icon ms-2">
                        <i className="bi bi-cart-plus"></i>
                      </span>
                    </button>
                    <div className="card p-4 shadow-sm">
                      <h5 className="mb-3">Resumen de compra</h5>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Subtotal:</span>
                        <span id="subtotal" className="fw-bold">
                          ${calcularSubtotal()}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Costo de envío:</span>
                        <span id="shipping-cost" className="fw-bold">
                          ${envio}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Total:</span>
                        <span id="total" className="fw-bold text-success">
                          ${calcularTotal()}
                        </span>
                      </div>
                      <button
                        id="confirm-order"
                        className="btn btn-primary w-100"
                        onClick={confirmarPedido}
                      >
                        Confirmar pedido
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NuevoPedido;
