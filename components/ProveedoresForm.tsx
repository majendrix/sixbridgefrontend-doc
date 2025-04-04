"use client";
import React, { useEffect, useState } from "react"; // Importa useState y useEffect
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { useMutation, gql } from "@apollo/client";
import "bootstrap/dist/js/bootstrap.bundle.min";

interface ProveedorData {
  obtenerProveedores: {
    nombre: string;
    email: string;
    telefono: string;
    direccioncalle: string;
    rut: string;
    codigo: string;
    comision: number;
  }[];
}

const NUEVO_PROVEEDOR = gql`
  mutation nuevoProveedor($input: ProveedorInput) {
    nuevoProveedor(input: $input) {
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
    }
  }
`;

export default function ProveedorForm() {
  const [shouldCloseModal, setShouldCloseModal] = useState(false); // Estado para controlar el cierre del modal

  // Mutation para crear nuevos usuarios
  const [nuevoProveedor] = useMutation(NUEVO_PROVEEDOR, {
    update(cache, { data: { nuevoProveedor } }) {
      // Read the query result with the correct type
      const { obtenerProveedores } = cache.readQuery<ProveedorData>({
        query: OBTENER_PROVEEDORES,
      }) || { obtenerProveedores: [] };
      cache.writeQuery({
        query: OBTENER_PROVEEDORES,
        data: {
          obtenerProveedores: [...obtenerProveedores, nuevoProveedor],
        },
      });
    },
  });

  // Validación del formulario con Formik
  const formik = useFormik({
    initialValues: {
      nombre: "",
      email: "",
      telefono: "",
      rut: "",
      direccioncalle: "",
      codigo: "",
      comision: "",
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
      console.log("Datos enviados:", valores);
      console.log(formik.errors); // Verifica si hay errores en la validación
      console.log(formik.touched); // Verifica si se están tocando los campos

      const { nombre, email, rut, telefono, codigo, comision } = valores;
      try {
        const { data } = await nuevoProveedor({
          variables: {
            input: {
              nombre,
              email,
              rut,
              telefono,
              codigo,
              comision,
            },
          },
        });
        console.log(data);

        // Indica que el modal debe cerrarse
        setShouldCloseModal(true);

        // Muestra el mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Proveedor creado exitosamente",
        });
      } catch (error) {
        console.log(error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al crear el proveedor.",
        });
      }
    },
  });

  // useEffect para cerrar el modal cuando shouldCloseModal es true
  useEffect(() => {
    if (shouldCloseModal) {
      const timer = setTimeout(() => {
        // Cierra el modal
        const modalElement = document.getElementById("addProveedorModal");
        const bodyElement = document.getElementsByTagName("body")[0]; // Access the first element in the collection

        if (modalElement) {
          modalElement.classList.remove("show");
          modalElement.style.display = "none";

          // Reset body styles
          bodyElement.style.overflow = "";
          bodyElement.style.paddingRight = "";

          // Ensure the modal-open class is removed from the body
          bodyElement.classList.remove("modal-open");

          // Remove all modal backdrops
          document
            .querySelectorAll(".modal-backdrop")
            .forEach((backdrop) => backdrop.remove());
        }

        // Restablece el estado
        setShouldCloseModal(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldCloseModal]);

  return (
    <form id="addVendedorForm" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
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
            <div className="text-danger">{formik.errors.nombre as string}</div>
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
            <div className="text-danger">{formik.errors.email as string}</div>
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
            <div className="text-danger">{formik.errors.codigo as string}</div>
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
      </div>
      <div className="modal-footer">
        <input
          type="submit"
          className="btn btn-primary"
          value="Agregar Proveedor"
        />
        <button
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
