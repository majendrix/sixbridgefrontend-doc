"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation, gql } from "@apollo/client";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { validateRUT } from "./validateRUT";
import regionesComunas from "@/data/regiones_comunas.json";

const OBTENER_VENDEDOR = gql`
  query obtenerVendedor($id: ID!) {
    obtenerVendedor(id: $id) {
      id
      rut
      nombre
      ndocumento
      email
      telefono
      password
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
      role
      estado
    }
  }
`;

const ACTUALIZAR_VENDEDOR = gql`
  mutation actualizarUsuario($id: ID!, $input: UsuarioInput) {
    actualizarUsuario(id: $id, input: $input) {
      id
      rut
      nombre
      ndocumento
      email
      telefono
      password
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
      role
      estado
    }
  }
`;

const formatRUT = (rut) => {
  const cleanedRUT = rut.replace(/[^0-9kK]/g, "").replace(/\s/g, "");
  const number = cleanedRUT.slice(0, -1);
  const dv = cleanedRUT.slice(-1).toUpperCase();

  let formattedNumber = "";
  if (number.length <= 7) {
    formattedNumber = `${number.slice(0, 1)}.${number.slice(
      1,
      4
    )}.${number.slice(4, 7)}`;
  } else {
    formattedNumber = `${number.slice(0, 2)}.${number.slice(
      2,
      5
    )}.${number.slice(5, 8)}`;
  }

  return `${formattedNumber}-${dv}`;
};

const EditarVendedor = ({ id }: { id: string }) => {
  const { data, loading, error } = useQuery(OBTENER_VENDEDOR, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  const [actualizarUsuario] = useMutation(ACTUALIZAR_VENDEDOR, {
    onCompleted: () => {
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Vendedor actualizado correctamente",
        confirmButtonText: "Aceptar",
      }).then(() => {
        router.push("/vendedores");
      });
    },
    onError: (error) => {
      console.error("Error al actualizar Vendedor:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Hubo un error al actualizar el Vendedor: ${error.message}`,
        confirmButtonText: "Aceptar",
      });
    },
    // Removido completamente el update y refetchQueries
  });

  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      rut: data?.obtenerVendedor?.rut || "",
      nombre: data?.obtenerVendedor?.nombre || "",
      ndocumento: data?.obtenerVendedor?.ndocumento || "",
      email: data?.obtenerVendedor?.email || "",
      telefono: data?.obtenerVendedor?.telefono || "",
      direccioncalle: data?.obtenerVendedor?.direccioncalle || "",
      direccionnumero: data?.obtenerVendedor?.direccionnumero || "",
      direcciondepto: data?.obtenerVendedor?.direcciondepto || "",
      direccioncomuna: data?.obtenerVendedor?.direccioncomuna || "",
      direccionregion: data?.obtenerVendedor?.direccionregion || "",
      direccionprovincia: data?.obtenerVendedor?.direccionprovincia || "",
      cuentabanconumero: data?.obtenerVendedor?.cuentabanconumero || "",
      cuentabanconombre: data?.obtenerVendedor?.cuentabanconombre || "",
      cuentabancotipocuenta: data?.obtenerVendedor?.cuentabancotipocuenta || "",
      carnetfrente: data?.obtenerVendedor?.carnetfrente || "",
      carnetreverso: data?.obtenerVendedor?.carnetreverso || "",
      password: data?.obtenerVendedor?.password || "",
      role: data?.obtenerVendedor?.role || "",
      estado: data?.obtenerVendedor?.estado ?? true,
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
    }),
    onSubmit: async (valores) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data } = await actualizarUsuario({
          variables: {
            id,
            input: valores,
          },
        });

        console.log("Valores a enviar:", valores);

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Vendedor actualizado correctamente",
          confirmButtonText: "Aceptar",
        }).then(() => {
          router.push("/vendedores");
        });
      } catch (error) {
        console.error("Error al actualizar Vendedor:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al actualizar el Vendedor",
          confirmButtonText: "Aceptar",
        });
      }
    },
    enableReinitialize: true,
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

  if (loading) return <p className="m-3">Cargando...</p>;
  if (error) return <p className="m-3">Error: {error.message}</p>;

  return (
    <div className="card-body">
      <div className="row">
        <div className="col-md-12">
          <h3 className="text-capitalize">Editar Vendedor</h3>
          <form onSubmit={formik.handleSubmit}>
            <div className="row ">
              <div className="mb-3 col-md">
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
                  <div className="text-danger">
                    {formik.errors.rut as string}
                  </div>
                )}
              </div>
              <div className="mb-3 col-md">
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
                    <p>{formik.errors.nombre as string}</p>
                  </div>
                ) : null}
              </div>
              <div className="mb-3 col-md">
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
            </div>
            <div className="row ">
              <div className="mb-3 col-md">
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
                    {formik.errors.direccionregion as string}
                  </div>
                ) : null}
              </div>

              {formik.values.direccionregion && (
                <div className="mb-3 col-md">
                  <label htmlFor="direccionprovincia" className="form-label">
                    Provincia:
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
                  {formik.touched.direccionprovincia &&
                  formik.errors.direccionprovincia ? (
                    <div className="text-danger">
                      {formik.errors.direccionprovincia as string}
                    </div>
                  ) : null}
                </div>
              )}

              {formik.values.direccionprovincia && comunas.length > 0 && (
                <div className="mb-3 col-md">
                  <label htmlFor="direccioncomuna" className="form-label">
                    Comuna:
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
                  {formik.touched.direccioncomuna &&
                  formik.errors.direccioncomuna ? (
                    <div className="text-danger">
                      {formik.errors.direccioncomuna as string}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            <div className="row ">
              <div className="mb-3 col-md">
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
                    <p>{formik.errors.email as string}</p>
                  </div>
                ) : null}
              </div>
              <div className="mb-3 col-md">
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
                    <p>{formik.errors.password as string}</p>
                  </div>
                ) : null}
              </div>
              <div className="mb-3 col-md">
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
            </div>
            <div className="row ">
              <div className="mb-3 col-md">
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
            </div>
            <div className="row ">
              <div className="mb-3 col-md">
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
              </div>
              <div className="mb-3 col-md">
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
              </div>
              <div className="mb-3 col-md">
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
            <div className="row">
              <div className="mb-3 col-md">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="estado"
                    name="estado"
                    checked={formik.values.estado}
                    onChange={() => {
                      const newValue = !formik.values.estado;
                      formik.setFieldValue("estado", newValue);
                    }}
                  />
                  <label className="form-check-label" htmlFor="estado">
                    {formik.values.estado ? "Activado" : "Desactivado"}
                  </label>
                </div>
              </div>
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

export default EditarVendedor;
