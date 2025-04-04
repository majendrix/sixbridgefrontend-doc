import React from "react";
import Image from "next/image";

const Producto = ({ producto }) => {
  const {
    nombre,
    existencia,
    descripcion,
    formato,
    precio,
    sku,
    skuproveedor,
  } = producto;
  return (
    <li className="list-group-item border-0 d-flex flex-column flex-md-row justify-content-between align-items-center p-4 mb-2 bg-gray-100 border-radius-lg">
      <div className="d-flex align-items-stretch col-12">
        <div className="d-flex align-items-stretch col-8">
          <Image
            src={`/productos/${skuproveedor}/${sku}.jpg`}
            className="me-3"
            alt={`Producto ${nombre}}`}
            width={800}
            height={800}
          />
          <div>
            <h6 className="mb-0 text-sm text-primary">{nombre}</h6>
            <p className="text-xs text-secondary mb-0">{descripcion}</p>
            <p className="text-xs text-secondary mb-0">{formato}</p>
            <h5 className="mb-0 text-xs text-dark">
              SKU <span>{sku}</span>
            </h5>
          </div>
        </div>
        <div className="text-end ms-md-auto me-md-4 col-4">
          <h5 className="font-weight-bolder mb-1">
            ${precio.toLocaleString()}
          </h5>
          <p className="text-xs text-secondary mb-0">Stock {existencia}</p>
        </div>
      </div>
    </li>
  );
};
export default Producto;
