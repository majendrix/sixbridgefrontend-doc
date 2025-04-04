"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  useQuery,
  useMutation,
  gql,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import Swal from "sweetalert2";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Producto {
  id: string;
  cantidad: number;
  nombre?: string;
  sku?: string;
  skuproveedor?: string;
  descripcion?: string;
  formato?: string;
  precio?: number;
  existencia?: number;
  subtotal?: number;
}

const OBTENER_PEDIDO = gql`
  query obtenerPedido($id: ID!) {
    obtenerPedido(id: $id) {
      id
      estado
      pedido {
        id
        cantidad
      }
      notas
      total
      envio
      proveedor {
        id
        nombre
        rut
        direccioncalle
        telefono
        comision
        codigo
      }
      cliente {
        id
        nombre
        rut
        direccioncalle
        telefono
        direccionnumero
        direccioncomuna
        direccionprovincia
        direccionregion
      }
      numeropedido
    }
  }
`;

const ACTUALIZAR_PEDIDO = gql`
  mutation actualizarPedido($id: ID!, $input: PedidoInput) {
    actualizarPedido(id: $id, input: $input) {
      id
      estado
      pedido {
        id
        cantidad
      }
      notas
      total
      envio
    }
  }
`;

const OBTENER_PRODUCTO = gql`
  query obtenerProducto($id: ID!) {
    obtenerProducto(id: $id) {
      id
      nombre
      existencia
      costo
      precio
      sku
      skuproveedor
      descripcion
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

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/graphql", // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

const EditarPedido = ({ id }: { id: string }) => {
  const idString = id.toString();
  const { data, loading, error } = useQuery(OBTENER_PEDIDO, {
    variables: { id: idString },
  });

  const { data: deliveryData } = useQuery(OBTENER_RANGOS_ENVIO);

  const [actualizarPedido] = useMutation(ACTUALIZAR_PEDIDO);
  const [estado, setEstado] = useState("");
  const [numeropedido, setNumeroPedido] = useState("");
  const [envio, setEnvio] = useState(0);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [notas, setNotas] = useState<string[]>([]);
  const [nuevaNota, setNuevaNota] = useState("");
  const router = useRouter();

  // Calculate subtotal
  const calcularSubtotal = useCallback(() => {
    return productos.reduce(
      (acc, producto) => acc + (producto.precio || 0) * producto.cantidad,
      0
    );
  }, [productos]); // Dependencia: productos

  // Calculate delivery cost
  const calcularCostoEnvio = useCallback(
    (purchaseTotal: number) => {
      if (!deliveryData?.obtenerCostoEnvio) return 0;

      const ranges = deliveryData.obtenerCostoEnvio;
      const matchingRange = ranges.find(
        (range) =>
          purchaseTotal >= range.minTotal && purchaseTotal <= range.maxTotal
      );

      return matchingRange ? matchingRange.costo : 0;
    },
    [deliveryData] // Dependencia: deliveryData
  );

  // Calculate total
  const calcularTotal = () => calcularSubtotal() + envio;

  // Update delivery cost when productos change
  useEffect(() => {
    const subtotal = calcularSubtotal();
    const costoEnvio = calcularCostoEnvio(subtotal);
    setEnvio(costoEnvio);
  }, [productos, deliveryData, calcularSubtotal, calcularCostoEnvio]);

  // Fetch product details and initialize state
  useEffect(() => {
    if (data) {
      setEstado(data.obtenerPedido.estado);
      setNumeroPedido(data.obtenerPedido.numeropedido);
      setEnvio(data.obtenerPedido.envio);
      setNotas(data.obtenerPedido.notas || []);

      const fetchProductos = async () => {
        try {
          const productosConDetalles = await Promise.all(
            data.obtenerPedido.pedido.map(async (producto: Producto) => {
              const { data: productoData } = await client.query({
                query: OBTENER_PRODUCTO,
                variables: { id: producto.id },
              });
              return {
                ...producto,
                ...productoData.obtenerProducto,
                subtotal:
                  (productoData.obtenerProducto.precio || 0) *
                  producto.cantidad,
              };
            })
          );
          setProductos(productosConDetalles);
        } catch (error) {
          console.error("Error fetching products:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al cargar los detalles del producto",
            confirmButtonText: "Aceptar",
          });
        }
      };

      fetchProductos();
    }
  }, [data]);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(e.target.value);
  };

  const handleProductoCantidadChange = (id: string, cantidad: number) => {
    setProductos((prev) =>
      prev.map((producto) =>
        producto.id === id
          ? {
              ...producto,
              cantidad,
              subtotal: (producto.precio || 0) * cantidad,
            }
          : producto
      )
    );
  };

  const handleAgregarNota = () => {
    if (nuevaNota.trim()) {
      setNotas((prev) => [...prev, nuevaNota.trim()]);
      setNuevaNota("");
    }
  };

  const handleSave = async () => {
    // Ensure the state is updated before constructing the input
    const input = {
      estado,
      pedido: productos.map((producto) => ({
        id: producto.id,
        cantidad: producto.cantidad,
      })),
      notas,
      envio,
    };

    console.log("Mutation Input:", input); // Log the input

    try {
      const { data } = await actualizarPedido({
        variables: {
          id,
          input,
        },
      });

      console.log("Mutation Result:", data); // Log the mutation result

      // Update the frontend state with the mutation result
      if (data?.actualizarPedido) {
        const {
          pedido: updatedPedido,
          notas: updatedNotas,
          envio: updatedEnvio,
        } = data.actualizarPedido;

        // Update productos state
        const updatedProductos = productos.map((producto) => {
          const updatedProducto = updatedPedido.find(
            (p) => p.id === producto.id
          );
          return updatedProducto
            ? { ...producto, cantidad: updatedProducto.cantidad }
            : producto;
        });

        setProductos(updatedProductos);
        setNotas(updatedNotas);
        setEnvio(updatedEnvio);

        console.log("Updated Frontend State:", {
          productos: updatedProductos,
          notas: updatedNotas,
          envio: updatedEnvio,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Pedido actualizado correctamente",
        confirmButtonText: "Aceptar",
      }).then(() => {
        router.push("/pedidos");
      });
    } catch (error) {
      console.log("Error al actualizar el pedido: ", error);
      console.log("GraphQL Errors:", error.graphQLErrors);
      console.log("Network Error:", error.networkError);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al actualizar el pedido",
        confirmButtonText: "Aceptar",
      });
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="card-body">
      <div className="row">
        <div className="col-md-12">
          <h3 className="text-capitalize">Editar Pedido N {numeropedido}</h3>
          <div className="row flex">
            <div className="col-12 col-xl-6 mb-4">
              <div className="mb-2">
                {data.obtenerPedido.cliente && (
                  <div id="cliente" className="col-6 mb-4 text-sm col-12">
                    <strong className="d-none d-sm-block">
                      Datos cliente:
                    </strong>
                    <p className="mb-0">{data.obtenerPedido.cliente.nombre}</p>
                    <p className="mb-0">{data.obtenerPedido.cliente.rut}</p>
                    <p className="mb-0">
                      {data.obtenerPedido.cliente.direccioncalle}{" "}
                      {data.obtenerPedido.cliente.direccionnumero}
                      {", "}
                      {data.obtenerPedido.cliente.direccioncomuna}
                      {", "}
                      {data.obtenerPedido.cliente.direccionprovincia}
                      {", "}
                      {data.obtenerPedido.cliente.direccionregion}
                    </p>
                    <p className="mb-0">
                      {data.obtenerPedido.cliente.telefono}
                    </p>
                    <p className="mb-0">{data.obtenerPedido.cliente.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-xl-6 mb-4">
              <div className="mb-2">
                <h4>Estado</h4>
                <select
                  className="form-select"
                  value={estado}
                  onChange={handleEstadoChange}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Observado">Observado</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
              <h4>Notas</h4>
              <ul className="list-group mb-3">
                {notas.map((nota: string, index: number) => (
                  <li className="list-group-item" key={index}>
                    {nota}
                  </li>
                ))}
              </ul>
              <div className="input-group mb-3 flex-nowrap">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Escribe una nota."
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                />
                <button
                  className="btn btn-secondary m-0"
                  onClick={handleAgregarNota}
                >
                  Agregar Nota
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-capitalize">Productos</h4>
            <ul className="list-group listado-productos">
              {productos.map((producto: Producto) => (
                <li
                  key={producto.id}
                  className="list-group-item border-0 d-flex flex-column flex-md-row justify-content-between align-items-center p-4 mb-2 bg-gray-100 border-radius-lg"
                >
                  <div className="d-flex align-items-stretch col-12 col-md-6">
                    <button
                      type="button"
                      className="btn btn-eliminar-producto btn-danger btn-close position-absolute top-0 end-0 text-primary"
                      onClick={() =>
                        setProductos((prev) =>
                          prev.filter((p) => p.id !== producto.id)
                        )
                      }
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
                        ${producto.precio}
                      </h5>
                      <p className="text-xs text-secondary mb-0">
                        Stock: {producto.existencia}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 mt-md-0 ">
                    <div className="d-flex align-items-center mt-3">
                      <button
                        className="btn btn-outline-secondary decrease-btn"
                        type="button"
                        aria-label="Disminuir cantidad"
                        onClick={() =>
                          handleProductoCantidadChange(
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
                        onChange={(e) =>
                          handleProductoCantidadChange(
                            producto.id,
                            Number(e.target.value)
                          )
                        }
                      />
                      <button
                        className="btn btn-outline-secondary increase-btn"
                        type="button"
                        aria-label="Aumentar cantidad"
                        onClick={() =>
                          handleProductoCantidadChange(
                            producto.id,
                            producto.cantidad + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-end mt-2">
                    <p className="mb-0 text-sm font-weight-bold">
                      Subtotal:{" "}
                      <span className="product-subtotal">
                        ${producto.subtotal}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-xl-6 card p-4 shadow-sm mb-4 float-end">
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
              onClick={handleSave}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPedido;
