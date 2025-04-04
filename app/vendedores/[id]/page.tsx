import React, { use } from "react";
import { notFound } from "next/navigation";
import EditarVendedor from "../../../components/EditarVendedor";

type paramsType = Promise<{ id: string }>;

const EditarVendedorPage = (props: { params: paramsType }) => {
  const params = use(props.params);
  const vendedorId = params.id;

  // Si no encontramos el clienteId, mostramos un 404
  if (!vendedorId) {
    notFound(); // Esto maneja el error mostrando una página 404
  }
  console.log("Vendedor id: ", vendedorId);

  return (
    <main className="main-content position-relative border-radius-lg ">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 mb-4">
            <div className="card z-index-2 h-100">
              <EditarVendedor id={vendedorId} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditarVendedorPage;
