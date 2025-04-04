import React, { use } from "react";
import { notFound } from "next/navigation";
import EditarCliente from "../../../components/EditarCliente";

type paramsType = Promise<{ id: string }>;

const EditarClientePage = (props: { params: paramsType }) => {
  const params = use(props.params);
  const clienteId = params.id;

  // Si no encontramos el clienteId, mostramos un 404
  if (!clienteId) {
    notFound(); // Esto maneja el error mostrando una página 404
  }

  return (
    <main className="main-content position-relative border-radius-lg ">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 mb-4">
            <div className="card z-index-2 h-100">
              <EditarCliente id={clienteId} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditarClientePage;
