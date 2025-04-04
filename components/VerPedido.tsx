"use client";
import React, { useEffect, useState } from "react";
import { useQuery, gql, ApolloClient, InMemoryCache } from "@apollo/client";
import Swal from "sweetalert2";
import Image from "next/image";

interface Producto {
  id: string;
  cantidad: number;
  nombre?: string;
  sku?: string;
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
      subtotal
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
      }
      numeropedido
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
      descripcion
    }
  }
`;

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/graphql", // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

const VerPedido = ({ id }: { id: string }) => {
  const idString = id.toString();
  const { data, loading, error } = useQuery(OBTENER_PEDIDO, {
    variables: { id: idString },
  });
  const [estado, setEstado] = useState("");
  const [numeropedido, setNumeroPedido] = useState("");
  const [envio, setEnvio] = useState(0);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [notas, setNotas] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setEstado(data.obtenerPedido.estado);
      setNumeroPedido(data.obtenerPedido.numeropedido);
      setEnvio(data.obtenerPedido.envio);
      setTotal(data.obtenerPedido.total);
      setSubtotal(data.obtenerPedido.subtotal);
      setNotas(data.obtenerPedido.notas || []);

      console.log("notas: ", notas);
      console.log("data.obtenerPedido.notas: ", data.obtenerPedido.notas);

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
  }, [data, notas]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const estadoClase = {
    Pendiente: "text-danger",
    Aprobado: "text-primary",
    Observado: "text-warning",
    Entregado: "text-success",
  };
  const claseEstado = estadoClase[estado] || "text-danger"; // Clase predeterminada

  return (
    <div className="card-body">
      <div className="row">
        <div className="col-md-12">
          <h3 className="text-capitalize">Editar Pedido N {numeropedido}</h3>
          <div className="row flex">
            <div className="col-12 col-xl-6 mb-4">
              {data.obtenerPedido.cliente && (
                <div id="cliente" className="col-6 mb-4 text-sm col-12">
                  <strong className="d-none d-sm-block">Datos cliente:</strong>
                  <p className="mb-0">{data.obtenerPedido.cliente.nombre}</p>
                  <p className="mb-0">{data.obtenerPedido.cliente.rut}</p>
                  <p className="mb-0">
                    {data.obtenerPedido.cliente.direccioncalle}{" "}
                    {data.obtenerPedido.cliente.direccionnumero}
                  </p>
                  <p className="mb-0">{data.obtenerPedido.cliente.telefono}</p>
                  <p className="mb-0">{data.obtenerPedido.cliente.email}</p>
                </div>
              )}
            </div>

            <div className="col-12 col-xl-6 mb-4">
              <div className="mb-2">
                <h4>
                  Estado: <strong className={`${claseEstado}`}>{estado}</strong>
                </h4>
              </div>
              {notas && (
                <div className="mb-2">
                  <h4>Notas</h4>

                  <ul className="list-group mb-3">
                    {notas.map((nota: string, index: number) => (
                      <li className="list-group-item" key={index}>
                        {nota}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <h4 className="text-capitalize">Productos</h4>
          <ul className="list-group listado-productos">
            {productos.map((producto: Producto) => (
              <li
                key={producto.id}
                className="list-group-item border-0 d-flex flex-column flex-md-row justify-content-between align-items-center p-4 mb-2 bg-gray-100 border-radius-lg"
              >
                <div className="d-flex align-items-stretch col-12 col-md-6">
                  <div className="d-flex align-items-stretch col-8">
                    <Image
                      src={`/productos/${producto.sku}.jpg`}
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
                <div className="mt-3 mt-md-0">
                  <p className="mb-0 text-sm font-weight-bold">
                    Cantidad:
                    <span className="product-subtotal">
                      {producto.cantidad}
                    </span>
                  </p>
                </div>
                <div className="text-end mt-2">
                  <p className="mb-0 text-sm font-weight-bold">
                    Subtotal:
                    <span className="product-subtotal">
                      ${producto.subtotal}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="card p-4 shadow-sm">
            <h5 className="mb-3">Resumen de compra</h5>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Subtotal:</span>
              <span id="subtotal" className="fw-bold">
                ${subtotal}
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
                ${total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerPedido;
