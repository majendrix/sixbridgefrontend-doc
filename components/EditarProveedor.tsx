"use client";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation, gql } from "@apollo/client";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useRouter } from "next/navigation"; // Import useRouter for redirection

const OBTENER_PROVEEDOR = gql`
  query obtenerProveedor($id: ID!) {
    obtenerProveedor(id: $id) {
      id
      nombre
      email
      telefono
      rut
      direccioncalle
      codigo
      comision
    }
  }
`;

const ACTUALIZAR_PROVEEDOR = gql`
  mutation actualizarProveedor($id: ID!, $input: ProveedorInput) {
    actualizarProveedor(id: $id, input: $input) {
      id
      nombre
      email
      telefono
      rut
      direccioncalle
      codigo
      comision
    }
  }
`;

const EditarProveedor = ({ id }: { id: string }) => {
  const { data, loading, error } = useQuery(OBTENER_PROVEEDOR, {
    variables: { id },
  });

  const [actualizarProveedor] = useMutation(ACTUALIZAR_PROVEEDOR);
  const router = useRouter(); // Initialize the router

  // Initialize Formik with the client data
  const formik = useFormik({
    initialValues: {
      nombre: data?.obtenerProveedor?.nombre || "",
      email: data?.obtenerProveedor?.email || "",
      telefono: data?.obtenerProveedor?.telefono || "",
      rut: data?.obtenerProveedor?.rut || "",
      direccioncalle: data?.obtenerProveedor?.direccioncalle || "",
      codigo: data?.obtenerProveedor?.codigo || "",
      comision: data?.obtenerProveedor?.comision || "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Email no válido")
        .required("El email es obligatorio"),
      rut: Yup.string().required("El rut es obligatorio"),
      telefono: Yup.string().required("El teléfono es obligatorio"),
      codigo: Yup.string().required("El codigo es obligatorio"),
      comision: Yup.string().required("La comision es obligatoria"),
    }),
    onSubmit: async (valores) => {
      console.log("valores: ", valores);
      try {
        const { data } = await actualizarProveedor({
          variables: {
            id,
            input: valores,
          },
        });
        console.log("Proveedor actualizado:", data.actualizarProveedor);

        // SweetAlert2 success message
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Proveedor actualizado correctamente",
          confirmButtonText: "Aceptar",
        }).then(() => {
          // Redirect to /clientes after the user clicks "Aceptar"
          router.push("/proveedores");
        });
      } catch (error) {
        console.error("Error al actualizar Proveedor:", error);

        // SweetAlert2 error message
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al actualizar el Proveedor",
          confirmButtonText: "Aceptar",
        });
      }
    },
    enableReinitialize: true, // Allow Formik to reinitialize when data changes
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="card-body">
      <div className="row">
        <div className="col-md-12">
          <h3 className="text-capitalize">Editar Proveedor</h3>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                className="form-control"
                id="nombre"
                name="nombre"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nombre}
              />
              {formik.touched.nombre && formik.errors.nombre ? (
                <div className="text-danger">
                  {formik.errors.nombre as string}
                </div>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-danger">
                  {formik.errors.email as string}
                </div>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="telefono" className="form-label">
                Teléfono
              </label>
              <input
                type="tel"
                className="form-control"
                id="telefono"
                name="telefono"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.telefono}
              />
              {formik.touched.telefono && formik.errors.telefono ? (
                <div className="text-danger">
                  {formik.errors.telefono as string}
                </div>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="rut" className="form-label">
                RUT
              </label>
              <input
                type="text"
                className="form-control"
                id="rut"
                name="rut"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.rut}
              />
              {formik.touched.rut && formik.errors.rut ? (
                <div className="text-danger">{formik.errors.rut as string}</div>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="direccioncalle" className="form-label">
                Dirección (Calle)
              </label>
              <input
                type="text"
                className="form-control"
                id="direccioncalle"
                name="direccioncalle"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.direccioncalle}
              />
              {formik.touched.direccioncalle && formik.errors.direccioncalle ? (
                <div className="text-danger">
                  {formik.errors.direccioncalle as string}
                </div>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="direccionnumero" className="form-label">
                Código
              </label>
              <input
                type="text"
                className="form-control"
                id="codigo"
                name="codigo"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.codigo}
              />
              {formik.touched.codigo && formik.errors.codigo ? (
                <div className="text-danger">
                  {formik.errors.codigo as string}
                </div>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="comision" className="form-label">
                Comisión
              </label>
              <input
                type="number"
                className="form-control"
                id="comision"
                name="comision"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.comision}
              />
              {formik.touched.comision && formik.errors.comision ? (
                <div className="text-danger">
                  {formik.errors.comision as string}
                </div>
              ) : null}
            </div>

            <button type="submit" className="btn btn-primary">
              Guardar Cambios
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProveedor;
