"use client";
import React from "react";
import { gql, useQuery } from "@apollo/client";
import Botonera from "../../../components/Botonera";
import Image from "next/image";

const OBTENER_PRODUCTOS_PROVEEDOR = gql`
  query obtenerProductosProveedor($skuproveedor: String!) {
    obtenerProductosProveedor(skuproveedor: $skuproveedor) {
      id
      nombre
      precio
      descripcion
      skuproveedor
      sku
      existencia
    }
  }
`;

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  skuproveedor: string;
  sku: string;
  existencia: number; // Optional property
}

interface PageProps {
  params: Promise<{
    skuproveedor: string;
  }>;
}

const ProductosProveedor = ({ params }: PageProps) => {
  // Unwrap the `params` object using React.use()
  const unwrappedParams = React.use(params);
  const { skuproveedor } = unwrappedParams;

  const { data, loading, error } = useQuery(OBTENER_PRODUCTOS_PROVEEDOR, {
    variables: { skuproveedor },
  });

  // Function to trigger the print dialog
  const handlePrint = () => {
    window.print();
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="wrap">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header pb-0 d-flex justify-content-between justify-content-center">
                <h6>Catálogo de productos</h6>
                <button
                  onClick={handlePrint} // Use the generarPDF function
                  className="btn btn-icon btn-primary"
                >
                  <span className="btn-inner--text">Descargar</span>
                  <span className="btn-inner--icon">
                    <i className="fa-solid fa-download"></i>
                  </span>
                </button>
              </div>
              <div className="card-body px-0 pt-0 pb-2">
                <div id="brochure">
                  <h1 className="text-center">Catálogo de Productos</h1>
                  <ul className="list-group">
                    {data.obtenerProductosProveedor.map(
                      (producto: Producto) => (
                        <li
                          key={producto.id}
                          className="list-group-item border-0 d-flex flex-column flex-md-row justify-content-between align-items-center p-4 mb-2 bg-gray-100 border-radius-lg"
                        >
                          <div className="d-flex align-items-stretch col-12">
                            <div className="d-flex align-items-stretch col-8">
                              <div className="col-6 text-centerx">
                                <Image
                                  src={`/productos/${producto.skuproveedor}/${producto.sku}.jpg`}
                                  className="mx-auto p-2"
                                  alt={`Producto ${producto.nombre}`}
                                  width={300}
                                  height={500}
                                />
                              </div>
                              <div className="col-6">
                                <h6 className="mb-0 text-sm text-primary">
                                  {producto.nombre}
                                </h6>
                                <p className="text-xs text-secondary mb-0">
                                  {producto.descripcion}
                                </p>
                                <h5 className="mb-0 text-xs text-dark">
                                  SKU <span>{producto.sku}</span>
                                </h5>
                              </div>
                            </div>
                            <div className="text-end ms-md-auto me-md-4 col-4">
                              <h5 className="font-weight-bolder mb-1">
                                ${producto.precio.toLocaleString()}
                              </h5>
                              <p className="text-xs text-secondary mb-0">
                                Stock <strong>{producto.existencia}</strong>
                              </p>
                            </div>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Botonera />
      </div>
    </div>
  );
};

export default ProductosProveedor;
