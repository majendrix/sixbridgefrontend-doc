"use client";
import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";
import { Producto } from "../types/types";

const OBTENER_PRODUCTOS = gql`
  query obtenerProductosProveedor($skuproveedor: String!) {
    obtenerProductosProveedor(skuproveedor: $skuproveedor) {
      id
      nombre
      existencia
      sku
      descripcion
      precio
      skuproveedor
    }
  }
`;

interface ModalProductosSelectProps {
  skuproveedor: string; // Recibe el skuproveedor desde el padre
  onSeleccionar: (productos: Producto[]) => void;
}

const ModalProductosSelect: React.FC<ModalProductosSelectProps> = ({
  skuproveedor,
  onSeleccionar,
}) => {
  const { data, loading, error } = useQuery<{
    obtenerProductosProveedor: Producto[];
  }>(OBTENER_PRODUCTOS, {
    variables: { skuproveedor },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Producto[]>([]);

  if (loading) return <p className="d-none">Cargando...</p>;
  if (error) return <p className="d-none">Error: {error.message}</p>;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const toggleProductSelection = (product: Producto) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.some((p) => p.id === product.id)
        ? prevSelected.filter((p) => p.id !== product.id)
        : [...prevSelected, product]
    );
  };

  const filteredProducts =
    data?.obtenerProductosProveedor.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(searchTerm) ||
        producto.sku.toLowerCase().includes(searchTerm)
    ) || [];

  const handleSeleccionar = () => {
    onSeleccionar(selectedProducts);
    setSelectedProducts([]);

    const modalElement = document.getElementById("productModal");
    const body = document.querySelector("body");

    // Check if modalElement exists
    if (modalElement) {
      modalElement.classList.remove("show");
      modalElement.style.display = "none";
    }

    // Check if body exists
    if (body) {
      body.style.overflow = "auto";
    }

    document.body.classList.remove("modal-open");
    document
      .querySelectorAll(".modal-backdrop")
      .forEach((backdrop) => backdrop.remove());
  };

  return (
    <div
      className="modal fade"
      id="productModal"
      tabIndex={-1}
      role="dialog"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="productModalLabel">
              Seleccionar producto
            </h5>
            <button
              type="button"
              className="btn-close text-primary"
              data-bs-dismiss="modal"
              aria-label="Cerrar"
            >
              <i className="fa fa-close"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <ul className="list-group">
              {filteredProducts.map((producto) => (
                <li
                  key={producto.id}
                  className="list-group-item border-0 d-flex flex-column flex-row justify-content-between align-items-center p-4 mb-2 bg-gray-100 border-radius-lg"
                >
                  <div className="form-check col-12">
                    <input
                      className="form-check-input product-checkbox float-end"
                      type="checkbox"
                      checked={selectedProducts.some(
                        (p) => p.id === producto.id
                      )}
                      onChange={() => toggleProductSelection(producto)}
                    />
                  </div>
                  <div className="d-flex align-items-stretch col-12">
                    <div className="d-flex align-items-stretch col-8">
                      <div className="col-6 text-center">
                        <Image
                          src={`/productos/${skuproveedor}/${producto.sku}.jpg`}
                          className="mx-auto p-2"
                          alt={`Producto ${producto.nombre}`}
                          width={800}
                          height={800}
                        />
                      </div>
                      <div className="col-6">
                        <h5 className="mb-0 text-xs text-dark">
                          SKU <span>{producto.sku}</span>
                        </h5>
                        <h6 className="mb-0 text-sm text-danger">
                          {producto.nombre}
                        </h6>
                        <p className="mb-0 text-xs text-secondary">
                          {producto.descripcion}
                        </p>
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
              ))}
            </ul>
          </div>
          <div className="modal-footer">
            <button
              id="selectProductsBtn"
              className="btn btn-primary"
              onClick={handleSeleccionar}
            >
              Seleccionar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProductosSelect;
