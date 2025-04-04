import React from "react";
import FormInventario from "../../components/FormInventario";

const Inventario = () => {
  return (
    <main className="main-content position-relative border-radius-lg ">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 mb-4">
            <div className="card z-index-2 h-100">
              <FormInventario />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default Inventario;
