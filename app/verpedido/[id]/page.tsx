import React, { use } from "react";
import { notFound } from "next/navigation";
import VerPedido from "../../../components/VerPedido";

type paramsType = Promise<{ id: string }>;

const EditarPedidoPage = (props: { params: paramsType }) => {
  const params = use(props.params);
  const pedidoId = params.id;

  // Si no encontramos el pedidoId, mostramos un 404
  if (!pedidoId) {
    notFound(); // Esto maneja el error mostrando una página 404
  }
  return (
    <main className="main-content position-relative border-radius-lg ">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 mb-4">
            <div className="card z-index-2 h-100">
              <VerPedido id={pedidoId} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditarPedidoPage;
