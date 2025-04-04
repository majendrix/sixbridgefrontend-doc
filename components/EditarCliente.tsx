"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation, gql } from "@apollo/client";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import { validateRUT } from "./validateRUT";
import regionesComunas from "@/data/regiones_comunas.json";

const OBTENER_CLIENTE = gql`
  query obtenerCliente($id: ID!) {
    obtenerCliente(id: $id) {
      id
      nombre
      email
      telefono
      rut
      direccioncalle
      direccionnumero
      direcciondepto
      direccioncomuna
      direccionregion
      direccionprovincia
    }
  }
`;

const ACTUALIZAR_CLIENTE = gql`
  mutation actualizarCliente($id: ID!, $input: ClienteInput) {
    actualizarCliente(id: $id, input: $input) {
      id
      nombre
      email
      telefono
      rut
      direccioncalle
      direccionnumero
      direcciondepto
      direccioncomuna
      direccionregion
      direccionprovincia
    }
  }
`;

const EditarCliente = ({ id }: { id: string }) => {
  const { data, loading, error } = useQuery(OBTENER_CLIENTE, {
    variables: { id },
  });

  const [actualizarCliente] = useMutation(ACTUALIZAR_CLIENTE);
  const router = useRouter(); // Initialize the router

  // Estados para regiones, provincias y comunas
  const [regiones, setRegiones] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [regionSeleccionada, setRegionSeleccionada] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [comunas, setComunas] = useState([]);

  // Cargar las regiones desde el JSON
  useEffect(() => {
    if (regionesComunas && Array.isArray(regionesComunas)) {
      setRegiones(regionesComunas);
    } else {
      console.error("Error: La estructura del JSON no es la esperada.");
    }
  }, []);

  // Inicializar Formik
  const formik = useFormik({
    initialValues: {
      nombre: data?.obtenerCliente?.nombre || "",
      email: data?.obtenerCliente?.email || "",
      telefono: data?.obtenerCliente?.telefono || "",
      rut: data?.obtenerCliente?.rut || "",
      direccioncalle: data?.obtenerCliente?.direccioncalle || "",
      direccionnumero: data?.obtenerCliente?.direccionnumero || "",
      direcciondepto: data?.obtenerCliente?.direcciondepto || "",
      direccioncomuna: data?.obtenerCliente?.direccioncomuna || "",
      direccionregion: data?.obtenerCliente?.direccionregion || "",
      direccionprovincia: data?.obtenerCliente?.direccionprovincia || "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Email no válido")
        .required("El email es obligatorio"),
      telefono: Yup.string().required("El teléfono es obligatorio"),
      rut: Yup.string()
        .required("El RUT es obligatorio")
        .test("valid-rut", "RUT no válido", (value) => validateRUT(value)),
    }),
    onSubmit: async (valores) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data } = await actualizarCliente({
          variables: {
            id,
            input: valores,
          },
        });

        // SweetAlert2 success message
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Cliente actualizado correctamente",
          confirmButtonText: "Aceptar",
        }).then(() => {
          // Redirect to /clientes after the user clicks "Aceptar"
          router.push("/clientes");
        });
      } catch (error) {
        console.error("Error al actualizar cliente:", error);

        // SweetAlert2 error message
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al actualizar el cliente",
          confirmButtonText: "Aceptar",
        });
      }
    },
    enableReinitialize: true, // Allow Formik to reinitialize when data changes
  });

  // Cargar provincias y comunas al inicializar el formulario
  useEffect(() => {
    if (formik.values.direccionregion) {
      const region = regiones.find(
        (r) => r.region === formik.values.direccionregion
      );
      if (region) {
        const provincias = region.provincias;

        if (formik.values.direccionprovincia) {
          const provincia = provincias.find(
            (p) => p.name === formik.values.direccionprovincia
          );
          if (provincia) {
            setComunas(provincia.comunas);
          }
        }
      }
    }
  }, [
    formik.values.direccionregion,
    formik.values.direccionprovincia,
    regiones,
  ]);

  if (loading) return <p>Cargando...</p>;
  if (error)
    return (
      <div className="card-body">
        <div className="row">
          <div className="col-md-12">
            <h3 className="text-capitalize">Editar Cliente</h3>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="card-body">
      <div className="row">
        <div className="col-md-12">
          <h3 className="text-capitalize">Editar Cliente</h3>
          <form onSubmit={formik.handleSubmit}>
            <div className="row ">
              <div className="mb-3 col-md">
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

              <div className="mb-3 col-md">
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

              <div className="mb-3 col-md">
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

              <div className="mb-3 col-md">
                <label htmlFor="rut" className="form-label">
                  RUT
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="rut"
                  name="rut"
                  disabled
                  value={formik.values.rut}
                />
                {formik.touched.rut && formik.errors.rut ? (
                  <div className="text-danger">
                    {formik.errors.rut as string}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="row ">
              <div className="mb-3 col-md">
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
                {formik.touched.direccioncalle &&
                formik.errors.direccioncalle ? (
                  <div className="text-danger">
                    {formik.errors.direccioncalle as string}
                  </div>
                ) : null}
              </div>

              <div className="mb-3 col-md">
                <label htmlFor="direccionnumero" className="form-label">
                  Dirección (Número)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="direccionnumero"
                  name="direccionnumero"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.direccionnumero}
                />
                {formik.touched.direccionnumero &&
                formik.errors.direccionnumero ? (
                  <div className="text-danger">
                    {formik.errors.direccionnumero as string}
                  </div>
                ) : null}
              </div>

              <div className="mb-3 col-md">
                <label htmlFor="direcciondepto" className="form-label">
                  Departamento
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="direcciondepto"
                  name="direcciondepto"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.direcciondepto}
                />
              </div>
            </div>
            <div className="row ">
              <div className="mb-3 col-md">
                <label htmlFor="direccionregion" className="form-label">
                  Región
                </label>
                <select
                  className="form-select"
                  id="direccionregion"
                  name="direccionregion"
                  value={formik.values.direccionregion}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setRegionSeleccionada(e.target.value);
                    setProvinciaSeleccionada("");
                    setComunas([]);
                  }}
                >
                  <option value="">Seleccione una región</option>
                  {regiones.map((region) => (
                    <option key={region.region} value={region.region}>
                      {region.region}
                    </option>
                  ))}
                </select>
              </div>

              {formik.values.direccionregion && (
                <div className="mb-3 col-md">
                  <label htmlFor="direccionprovincia" className="form-label">
                    Provincia
                  </label>
                  <select
                    className="form-select"
                    id="direccionprovincia"
                    name="direccionprovincia"
                    value={formik.values.direccionprovincia}
                    onChange={(e) => {
                      formik.handleChange(e);
                      setProvinciaSeleccionada(e.target.value);
                      setComunas([]);

                      const region = regiones.find(
                        (r) => r.region === formik.values.direccionregion
                      );
                      if (region) {
                        const provincia = region.provincias.find(
                          (p) => p.name === e.target.value
                        );
                        setComunas(provincia ? provincia.comunas : []);
                      }
                    }}
                  >
                    <option value="">Seleccione una provincia</option>
                    {regiones
                      .find((r) => r.region === formik.values.direccionregion)
                      ?.provincias.map((provincia) => (
                        <option key={provincia.name} value={provincia.name}>
                          {provincia.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {formik.values.direccionprovincia && comunas.length > 0 && (
                <div className="mb-3 col-md">
                  <label htmlFor="direccioncomuna" className="form-label">
                    Comuna
                  </label>
                  <select
                    className="form-select"
                    id="direccioncomuna"
                    name="direccioncomuna"
                    value={formik.values.direccioncomuna}
                    onChange={formik.handleChange}
                  >
                    <option value="">Seleccione una comuna</option>
                    {comunas.map((comuna) => (
                      <option key={comuna.code} value={comuna.name}>
                        {comuna.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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

export default EditarCliente;
