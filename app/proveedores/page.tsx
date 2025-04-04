"use client"; // Esto asegura que Formik se ejecute solo en el cliente
import React from "react";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { gql, useQuery, useMutation } from "@apollo/client";

// Carga dinámica de componentes que podrían acceder a `document`
const Botonera = dynamic(() => import("../../components/Botonera"), {
  ssr: false,
});
const ProveedoresForm = dynamic(
  () => import("../../components/ProveedoresForm"),
  { ssr: false }
);

const OBTENER_PROVEEDORES = gql`
  query obtenerProveedores {
    obtenerProveedores {
      id
      nombre
      rut
      codigo
      comision
      telefono
      direccioncalle
      estado
    }
  }
`;

const CAMBIAR_ESTADO_PROVEEDOR = gql`
  mutation cambiarEstadoProveedor($id: ID!) {
    cambiarEstadoProveedor(id: $id) {
      id
      estado
    }
  }
`;

interface Proveedor {
  id: string;
  nombre: string;
  rut: string;
  codigo: string;
  telefono: string;
  comision: number;
  direccioncalle: string;
  estado: boolean; // Add estado to the interface
  email?: string; // Optional, since it's not in the query but used in the JSX
}

const Proveedores = () => {
  // Consulta Apollo
  const { data, loading, error, refetch } = useQuery(OBTENER_PROVEEDORES);
  const [cambiarEstadoProveedor] = useMutation(CAMBIAR_ESTADO_PROVEEDOR);
  const router = useRouter();

  // Manejo de estados
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleEditarProveedor = (id: string) => {
    router.push(`/proveedores/${id}`);
  };

  const handleCambiarEstadoProveedor = async (
    id: string,
    estadoActual: boolean
  ) => {
    try {
      const { data } = await cambiarEstadoProveedor({ variables: { id } });
      if (data.cambiarEstadoProveedor.estado !== estadoActual) {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: `Proveedor ${
            data.cambiarEstadoProveedor.estado ? "activado" : "desactivado"
          }.`,
        });
        refetch(); // Refetch the data to update the list
      }
    } catch (err) {
      console.error("Error al cambiar el estado del proveedor:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cambiar el estado del proveedor.",
      });
    }
  };

  return (
    <div className="wrap">
      <div
        className="modal fade"
        id="addProveedorModal"
        aria-labelledby="addProveedorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addProveedorModalLabel">
                Agregar Nuevo Proveedor
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <ProveedoresForm />
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4 px-1">
              <div className="card-header pb-0">
                <h6>Listado de proveedores</h6>
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#addProveedorModal"
                >
                  <i className="fas fa-user-plus"></i> Agregar Proveedor
                </button>
              </div>
              <div className="card-body px-0 pt-0 pb-2">
                <ul className="list-group">
                  {data.obtenerProveedores.map(
                    (proveedor: Proveedor, index: number) => (
                      <li
                        key={index}
                        className={`list-group-item border-0 d-flex p-4 mb-2 ${
                          proveedor.estado ? "bg-gray-100" : "bg-gray-300"
                        } border-radius-lg`}
                      >
                        <div className="d-flex flex-column col-9">
                          <h5 className="mb-0 text-sm text-dark">
                            {proveedor.nombre}
                          </h5>
                          <h6 className="mb-0 text-sm">{proveedor.email}</h6>
                          <p className="text-xs text-secondary mb-0">
                            RUT: {proveedor.rut}
                          </p>
                          <p className="text-xs text-secondary mb-0">
                            FONO: {proveedor.telefono}
                          </p>
                          <p className="text-xs text-secondary mb-0">
                            CODIGO: {proveedor.codigo}
                          </p>
                          <p className="text-xs text-secondary mb-0">
                            COMISION: {proveedor.comision}
                          </p>
                          <p className="text-xs text-secondary mb-0">
                            ESTADO: {proveedor.estado ? "Activo" : "Inactivo"}
                          </p>
                        </div>
                        <div className="col-3">
                          <button
                            onClick={() => handleEditarProveedor(proveedor.id)}
                            className="btn mt-2 ms-2 btn-primary float-end"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() =>
                              handleCambiarEstadoProveedor(
                                proveedor.id,
                                proveedor.estado
                              )
                            }
                            className={`btn mt-2 float-end ${
                              proveedor.estado ? "btn-danger" : "btn-success"
                            }`}
                          >
                            {proveedor.estado ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Botonera />
      </div>
    </div>
  );
};
export default Proveedores;
