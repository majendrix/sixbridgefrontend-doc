"use client";
import React, { useEffect, useState } from "react"; // Importa useEffect y useState
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, gql } from "@apollo/client";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { validateRUT } from "./validateRUT";
import regionesComunas from "@/data/regiones_comunas.json";
import Swal from "sweetalert2";

const NUEVA_CUENTA = gql`
  mutation nuevoUsuario($input: UsuarioInput) {
    nuevoUsuario(input: $input) {
      id
      rut
      nombre
      ndocumento
      email
      telefono
      direccioncalle
      direccionnumero
      direcciondepto
      direccioncomuna
      direccionregion
      direccionprovincia
      cuentabanconumero
      cuentabanconombre
      cuentabancotipocuenta
      carnetfrente
      carnetreverso
      password
      role
      estado
    }
  }
`;

const OBTENER_USUARIOS_VENDEDOR = gql`
  query obtenerUsuariosPorRol($role: String!, $limit: Int!, $offset: Int!) {
    obtenerUsuariosPorRol(role: $role, limit: $limit, offset: $offset) {
      id
      rut
      nombre
      ndocumento
      email
      telefono
      direccioncalle
      direccionnumero
      direcciondepto
      direccioncomuna
      direccionregion
      direccionprovincia
      cuentabanconumero
      cuentabanconombre
      cuentabancotipocuenta
      carnetfrente
      carnetreverso
      password
      role
      estado
    }
    totalVendedores(role: $role)
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

type ObtenerUsuariosPorRolResponse = {
  obtenerUsuariosPorRol: {
    id: string;
    rut: string;
    nombre: string;
    ndocumento: string;
    email: string;
    telefono: string;
    direccioncalle: string;
    direccionnumero: string;
    direcciondepto: string;
    direccioncomuna: string;
    direccionregion: string;
    direccionprovincia: string;
    cuentabanconumero: string;
    cuentabanconombre: string;
    cuentabancotipocuenta: string;
    carnetfrente: string;
    carnetreverso: string;
    password: string;
    role: string;
    estado: string;
  }[];
  totalVendedores: number;
};

export default function VendedoresForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [mensaje, guardarMensaje] = useState<string | null>(null); // Estado para el mensaje
  const [shouldCloseModal, setShouldCloseModal] = useState(false); // Estado para controlar el cierre del modal
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
  const [nuevoUsuario] = useMutation(NUEVA_CUENTA, {
    update(cache, { data: { nuevoUsuario } }) {
      // Definir las variables para la consulta
      const variables = {
        role: "vendedor",
        estado: true,
        limit: 6, // Ajusta según tu paginación
        offset: 0, // Ajusta según tu paginación
      };

      // Leer la consulta actual del caché
      const { obtenerUsuariosPorRol, totalVendedores } = cache.readQuery<
        ObtenerUsuariosPorRolResponse
      >({
        query: OBTENER_USUARIOS_VENDEDOR,
        variables,
      }) || { obtenerUsuariosPorRol: [], totalVendedores: 0 };

      // Escribir los nuevos datos en el caché
      cache.writeQuery({
        query: OBTENER_USUARIOS_VENDEDOR,
        variables,
        data: {
          obtenerUsuariosPorRol: [nuevoUsuario, ...obtenerUsuariosPorRol], // Agregar el nuevo usuario al inicio
          totalVendedores: totalVendedores + 1, // Incrementar el total de vendedores
        },
      });
    },
  });

  // Validación del formulario con Formik
  const formik = useFormik({
    initialValues: {
      rut: "",
      nombre: "",
      ndocumento: "",
      email: "",
      telefono: "",
      direccioncalle: "",
      direccionnumero: "",
      direcciondepto: "",
      direccioncomuna: "",
      direccionprovincia: "",
      direccionregion: "",
      cuentabanconumero: "",
      cuentabanconombre: "",
      cuentabancotipocuenta: "",
      carnetfrente: null,
      carnetreverso: null,
      password: "",
      role: "vendedor",
    },
    validationSchema: Yup.object({
      rut: Yup.string()
        .required("El RUT es obligatorio")
        .test("valid-rut", "RUT no válido", (value) => validateRUT(value)),
      nombre: Yup.string().required("El nombre es obligatorio"),
      email: Yup.string()
        .email("Email no válido")
        .required("El email es obligatorio"),
      password: Yup.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .required("La contraseña es obligatoria"),
      direccionregion: Yup.string().required("La región es obligatoria"),
      direccionprovincia: Yup.string().required("La provincia es obligatoria"),
      direccioncomuna: Yup.string().required("La comuna es obligatoria"),
      telefono: Yup.string()
        .matches(
          /^\+56\d{9}$/,
          "El teléfono debe comenzar con +56 y tener 9 dígitos adicionales"
        )
        .required("El teléfono es obligatorio"),
    }),
    onSubmit: async (valores, { resetForm }) => {
      console.log("Datos enviados:", valores);
      console.log(formik.errors); // Verifica si hay errores en la validación
      console.log(formik.touched); // Verifica si se están tocando los campos

      const {
        nombre,
        email,
        password,
        rut,
        telefono,
        ndocumento,
        direccioncalle,
        direccionnumero,
        direcciondepto,
        direccioncomuna,
        direccionregion,
        direccionprovincia,
        cuentabanconumero,
        cuentabanconombre,
        carnetfrente,
        carnetreverso,
        role,
      } = valores;
      try {
        const { data } = await nuevoUsuario({
          variables: {
            input: {
              nombre,
              email,
              password,
              rut,
              telefono,
              ndocumento,
              direccioncalle,
              direccionnumero,
              direcciondepto,
              direccioncomuna,
              direccionregion,
              direccionprovincia,
              cuentabanconumero,
              cuentabanconombre,
              carnetfrente,
              carnetreverso,
              role,
            },
          },
        });
        console.log(data);
        guardarMensaje(
          `Se creó correctamente el Usuario: ${data.nuevoUsuario.nombre}`
        );

        // Resetear el formulario
        resetForm();

        // Resetear también los estados de región/comuna
        setRegionSeleccionada("");
        setProvinciaSeleccionada("");
        setComunas([]);
        onSuccess();

        // Indica que el modal debe cerrarse
        setShouldCloseModal(true);
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Se creó correctamente el Usuario: ${data.nuevoUsuario.nombre}",
        });
      } catch (error) {
        guardarMensaje(error.message);
        setTimeout(() => {
          guardarMensaje(null);
        }, 3000);
      }
    },
  });

  // Agrega este useEffect
  useEffect(() => {
    const modalElement = document.getElementById("addVendedorModal");

    const handleShow = () => {
      formik.resetForm();
      setRegionSeleccionada("");
      setProvinciaSeleccionada("");
      setComunas([]);
      guardarMensaje(null);
    };

    if (modalElement) {
      modalElement.addEventListener("show.bs.modal", handleShow);
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener("show.bs.modal", handleShow);
      }
    };
  }, [formik]);

  // useEffect para cerrar el modal cuando shouldCloseModal es true
  useEffect(() => {
    if (shouldCloseModal) {
      const timer = setTimeout(() => {
        // Cierra el modal
        const modalElement = document.getElementById("addVendedorModal");
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
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldCloseModal]);

  const mostrarMensaje = () => {
    return (
      <div className="mb-3">
        <p>{mensaje}</p>
      </div>
    );
  };

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
    <form id="addVendedorForm" onSubmit={formik.handleSubmit}>
      <div className="modal-body">
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
          <label htmlFor="nombre" className="form-label">
            Nombres y Apellido
          </label>
          <input
            type="text"
            className="form-control border-secondary"
            id="nombre"
            name="nombre"
            required
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.nombre}
          />
          {formik.touched.nombre && formik.errors.nombre ? (
            <div className="my-2 text-warning">
              <p>{formik.errors.nombre}</p>
            </div>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="ndocumento" className="form-label">
            Número Documento
          </label>
          <input
            type="text"
            className="form-control border-secondary"
            id="ndocumento"
            name="ndocumento"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.ndocumento}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="direccioncalle" className="form-label">
            Dirección
          </label>
          <input
            type="text"
            className="form-control border-secondary"
            id="direccioncalle"
            name="direccioncalle"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.direccioncalle}
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
          {formik.touched.direccionregion && formik.errors.direccionregion ? (
            <div className="text-danger">{formik.errors.direccionregion}</div>
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
            {formik.touched.direccioncomuna && formik.errors.direccioncomuna ? (
              <div className="text-danger">{formik.errors.direccioncomuna}</div>
            ) : null}
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo Electrónico
          </label>
          <input
            type="email"
            className="form-control border-secondary"
            id="email"
            name="email"
            required
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="my-2 text-warning">
              <p>{formik.errors.email}</p>
            </div>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            className="form-control border-secondary"
            id="password"
            name="password"
            required
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="my-2 text-warning">
              <p>{formik.errors.password}</p>
            </div>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="telefono" className="form-label">
            Número Telefónico
          </label>
          <input
            type="tel"
            className="form-control border-secondary"
            id="telefono"
            name="telefono"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.telefono}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Foto Carnet de Identidad</label>
          <input
            type="file"
            className="form-control border-secondary mb-2"
            id="carnetfrente"
            name="carnetfrente"
            accept="image/*"
          />
          <input
            type="file"
            className="form-control border-secondary"
            id="carnetreverso"
            name="carnetreverso"
            accept="image/*"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cuentabanconumero" className="form-label">
            Número Cuenta Bancaria
          </label>
          <input
            type="text"
            className="form-control border-secondary mb-2"
            id="cuentabanconumero"
            name="cuentabanconumero"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.cuentabanconumero}
          />
          <label htmlFor="cuentabanconombre" className="form-label">
            Banco
          </label>
          <input
            type="text"
            className="form-control border-secondary mb-2"
            id="cuentabanconombre"
            name="cuentabanconombre"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.cuentabanconombre}
          />
          <label htmlFor="cuentabancotipocuenta" className="form-label">
            Tipo de Cuenta
          </label>
          <select
            id="cuentabancotipocuenta"
            name="cuentabancotipocuenta"
            className="form-select border-secondary"
          >
            <option value="">Seleccione</option>
            <option value="Cuenta Corriente">Cuenta Corriente</option>
            <option value="Cuenta Vista">Cuenta Vista</option>
            <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        {mensaje && mostrarMensaje()}
        <input
          type="submit"
          className="btn btn-primary"
          value="Agregar Vendedor"
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
