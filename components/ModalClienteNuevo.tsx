"use client"; // Esto asegura que Formik se ejecute solo en el cliente
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, gql } from "@apollo/client";
import { validateRUT } from "./validateRUT";
import regionesComunas from "@/data/regiones_comunas.json";

// Define the type for the query result
interface ClientesVendedorData {
  obtenerClientesVendedorTodos: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    rut: string;
    direccioncalle: string;
    direccionnumero: string;
    direcciondepto: string;
    direccioncomuna: string;
    direccionregion: string;
    direccionprovincia: string;
  }[];
}

// Consulta para obtener clientes
const GET_CLIENTES = gql`
  query obtenerClientesVendedorTodos($limit: Int!, $offset: Int!) {
    obtenerClientesVendedorTodos(limit: $limit, offset: $offset) {
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

const NUEVA_CUENTA_CLIENTE = gql`
  mutation nuevoCliente($input: ClienteInput) {
    nuevoCliente(input: $input) {
      id
      rut
      nombre
      email
      telefono
      direccioncalle
      direccionnumero
      direcciondepto
      direccioncomuna
      direccionregion
      direccionprovincia
    }
  }
`;

const formatRUT = (rut) => {
  // Remove all non-alphanumeric characters and spaces
  const cleanedRUT = rut.replace(/[^0-9kK]/g, "").replace(/\s/g, "");

  // Separate the number and the verification digit
  const number = cleanedRUT.slice(0, -1);
  const dv = cleanedRUT.slice(-1).toUpperCase();

  // Format the number with dots
  let formattedNumber = "";
  if (number.length <= 7) {
    // Format for 7-digit RUTs (e.g., 6.553.360-k)
    formattedNumber = `${number.slice(0, 1)}.${number.slice(
      1,
      4
    )}.${number.slice(4, 7)}`;
  } else {
    // Format for 8-digit RUTs (e.g., 15.957.980-8)
    formattedNumber = `${number.slice(0, 2)}.${number.slice(
      2,
      5
    )}.${number.slice(5, 8)}`;
  }

  // Combine the formatted number and verification digit
  return `${formattedNumber}-${dv}`;
};

export default function ModalClienteNuevo() {
  // State para el mensaje
  const [mensaje, guardarMensaje] = useState<string | null>(null);
  const [regionSeleccionada, setRegionSeleccionada] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [comunas, setComunas] = useState<{ name: string; code: string }[]>([]);
  const [regiones, setRegiones] = useState<
    {
      region: string;
      provincias: { name: string; comunas: { name: string; code: string }[] }[];
    }[]
  >([]);

  // Mutation para crear nuevos usuarios
  const [nuevoCliente] = useMutation(NUEVA_CUENTA_CLIENTE, {
    update(cache, { data: { nuevoCliente } }) {
      // Definir las variables para la consulta
      const variables = { limit: 10, offset: 0 }; // Asegúrate de que coincidan con las variables de la consulta original

      // Leer la consulta actual del caché
      const { obtenerClientesVendedorTodos } = cache.readQuery<
        ClientesVendedorData
      >({
        query: GET_CLIENTES,
        variables,
      }) || { obtenerClientesVendedorTodos: [] };

      // Escribir los nuevos datos en el caché
      cache.writeQuery({
        query: GET_CLIENTES,
        variables,
        data: {
          obtenerClientesVendedorTodos: [
            ...obtenerClientesVendedorTodos,
            nuevoCliente,
          ],
        },
      });

      // Depurar el caché
      console.log("Caché después de la actualización:", cache.extract());
    },
  });

  // Validación del formulario con Formik
  const formik = useFormik({
    initialValues: {
      rut: "",
      nombre: "",
      email: "",
      telefono: "",
      direccioncalle: "",
      direccionnumero: "",
      direcciondepto: "",
      direccioncomuna: "",
      direccionregion: "",
      direccionprovincia: "",
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
      direccionregion: Yup.string().required("La región es obligatoria"),
      direccionprovincia: Yup.string().required("La provincia es obligatoria"),
      direccioncomuna: Yup.string().required("La comuna es obligatoria"),
    }),
    onSubmit: async (valores) => {
      try {
        const { data } = await nuevoCliente({
          variables: { input: valores },
          optimisticResponse: {
            __typename: "Mutation",
            nuevoCliente: {
              __typename: "Cliente",
              id: "temp-id", // ID temporal
              ...valores, // Valores del formulario
            },
          },
        });
        console.log("Cliente creado:", data.nuevoCliente);

        guardarMensaje(`Cliente creado: ${data.nuevoCliente.nombre}`);

        setTimeout(() => {
          guardarMensaje(null);

          // Cierra el modal
          const modalElement = document.getElementById("addClientModal");
          if (modalElement) {
            modalElement.classList.remove("show");
            modalElement.style.display = "none";

            document.body.classList.remove("modal-open");
            document
              .querySelectorAll(".modal-backdrop")
              .forEach((backdrop) => backdrop.remove());
          }
        }, 3000);
      } catch (error) {
        console.error("Error al crear cliente:", error);
        guardarMensaje("Error al crear cliente");
        setTimeout(() => guardarMensaje(null), 3000);
      }
    },
  });

  // Cargar las regiones desde el JSON
  useEffect(() => {
    if (regionesComunas && Array.isArray(regionesComunas)) {
      setRegiones(regionesComunas);
    } else {
      console.error("Error: La estructura del JSON no es la esperada.");
    }
  }, []);

  // Manejar el cambio de la región
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const regionNombre = event.target.value;
    setRegionSeleccionada(regionNombre);
    setProvinciaSeleccionada(""); // Reiniciar la selección de provincia

    // Buscar las provincias de la región seleccionada
    const region = regiones.find((r) => r.region === regionNombre);
    if (region) {
      setComunas([]); // Limpiar las comunas cuando cambia la región
    }
  };

  // Manejar el cambio de la provincia
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleProvinciaChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const provinciaNombre = event.target.value;
    setProvinciaSeleccionada(provinciaNombre);

    // Buscar la provincia seleccionada dentro de la región y obtener sus comunas
    const region = regiones.find((r) => r.region === regionSeleccionada);
    if (region) {
      const provincia = region.provincias.find(
        (p) => p.name === provinciaNombre
      );
      setComunas(provincia ? provincia.comunas : []);
    }
  };

  return (
    <div
      className="modal fade"
      id="addClientModal"
      aria-labelledby="addClientModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="addClientModalLabel">
              Agregar Cliente
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
            {/* Display the mensaje here */}
            {mensaje && (
              <div
                className={`alert ${
                  mensaje.includes("Error") ? "alert-danger" : "alert-success"
                }`}
              >
                {mensaje}
              </div>
            )}
            <form id="addClientForm" onSubmit={formik.handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  required
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nombre}
                />
                {formik.touched.nombre && formik.errors.nombre ? (
                  <div className="text-danger">{formik.errors.nombre}</div>
                ) : null}
              </div>
              <div className="mb-3">
                <label htmlFor="rut" className="form-label">
                  RUT
                </label>
                <input
                  type="text"
                  className="form-control border-secondary"
                  id="rut"
                  name="rut"
                  placeholder="12.345.678-9"
                  onChange={(e) => {
                    const formattedRUT = formatRUT(e.target.value);
                    formik.setFieldValue("rut", formattedRUT);
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.rut}
                />
                {formik.touched.rut && formik.errors.rut && (
                  <div className="text-danger">{formik.errors.rut}</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="telefono"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.telefono}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  required
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-danger">{formik.errors.email}</div>
                ) : null}
              </div>
              <div className="mb-3">
                <label htmlFor="direccioncalle" className="form-label">
                  Dirección
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="direccioncalle"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.direccioncalle}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="direccionnumero" className="form-label">
                  Número
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="direccionnumero"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.direccionnumero}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="direcciondepto" className="form-label">
                  Departamento
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="direcciondepto"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.direcciondepto}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="direccionregion" className="form-label">
                  Región
                </label>
                <select
                  className="form-select"
                  id="direccionregion"
                  name="direccionregion"
                  value={formik.values.direccionregion}
                  onChange={(e) => {
                    formik.handleChange(e); // Actualizar el valor en Formik
                    setRegionSeleccionada(e.target.value); // Actualizar el estado local
                    setProvinciaSeleccionada(""); // Reiniciar la provincia seleccionada
                    setComunas([]); // Reiniciar las comunas
                  }}
                >
                  <option value="">Seleccione una región</option>
                  {regiones.length > 0 ? (
                    regiones.map((region) => (
                      <option key={region.region} value={region.region}>
                        {region.region}
                      </option>
                    ))
                  ) : (
                    <option value="">Cargando regiones...</option>
                  )}
                </select>
                {formik.touched.direccionregion &&
                formik.errors.direccionregion ? (
                  <div className="text-danger">
                    {formik.errors.direccionregion}
                  </div>
                ) : null}
              </div>

              {formik.values.direccionregion && (
                <div className="mb-3">
                  <label htmlFor="direccionprovincia" className="form-label">
                    Provincia:
                  </label>
                  <select
                    className="form-select"
                    id="direccionprovincia"
                    name="direccionprovincia"
                    value={formik.values.direccionprovincia}
                    onChange={(e) => {
                      formik.handleChange(e); // Actualizar el valor en Formik
                      setProvinciaSeleccionada(e.target.value); // Actualizar el estado local
                      setComunas([]); // Reiniciar las comunas

                      // Obtener las comunas de la provincia seleccionada
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
                  {formik.touched.direccionprovincia &&
                  formik.errors.direccionprovincia ? (
                    <div className="text-danger">
                      {formik.errors.direccionprovincia}
                    </div>
                  ) : null}
                </div>
              )}

              {formik.values.direccionprovincia && (
                <div className="mb-3">
                  <label htmlFor="direccioncomuna" className="form-label">
                    Comuna:
                  </label>
                  <select
                    className="form-select"
                    id="direccioncomuna"
                    name="direccioncomuna"
                    value={formik.values.direccioncomuna}
                    onChange={formik.handleChange}
                    disabled={comunas.length === 0}
                  >
                    <option value="">Seleccione una comuna</option>
                    {comunas.map((comuna) => (
                      <option key={comuna.code} value={comuna.name}>
                        {comuna.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.direccioncomuna &&
                  formik.errors.direccioncomuna ? (
                    <div className="text-danger">
                      {formik.errors.direccioncomuna}
                    </div>
                  ) : null}
                </div>
              )}
              <button type="submit" className="btn btn-primary">
                Crear Cliente
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
