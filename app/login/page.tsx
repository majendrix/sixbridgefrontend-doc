"use client"; // Esto asegura que Formik se ejecute solo en el cliente
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { gql, useMutation } from "@apollo/client";
import Image from "next/image";
import jwt from "jsonwebtoken";

const AUTENTICAR_USUARIO = gql`
  mutation autenticarUsuario($input: AutenticarInput!) {
    autenticarUsuario(input: $input) {
      token
    }
  }
`;

export default function Login() {
  const [mensaje, guardarMensaje] = useState<string | null>(null);

  // Mutation para autenticar
  const [autenticarUsuario] = useMutation(AUTENTICAR_USUARIO);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("El email no es válido")
        .required("El email no puede ir vacío"),
      password: Yup.string().required("El password es obligatorio"),
    }),
    onSubmit: async (valores) => {
      const { email, password } = valores;
      try {
        console.log("Sending login request with:", { email, password }); // Log the input

        const { data } = await autenticarUsuario({
          variables: {
            input: {
              email,
              password,
            },
          },
        });

        console.log("Login response:", data); // Log the response

        guardarMensaje("Autenticando...");

        // Guardar el token y el usuario en el almacenamiento local
        const { token } = data.autenticarUsuario;
        localStorage.setItem("token", token);

        // Obtener el usuario desde el token (si es necesario)
        const decodedToken = jwt.decode(token);
        if (decodedToken) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: decodedToken.id,
              role: decodedToken.role,
            })
          );
        }

        // Redireccionar después de 2 segundos
        window.location.href = "/";
      } catch (error) {
        console.error("Login error:", error); // Log the error
        if (error instanceof Error) {
          guardarMensaje(error.message);
        } else {
          guardarMensaje("Ocurrió un error inesperado");
        }
        setTimeout(() => {
          guardarMensaje(null);
        }, 3000);
      }
    },
  });

  const mostrarMensaje = () => {
    return (
      <div className="mt-3 text-warning">
        <p>{mensaje}</p>
      </div>
    );
  };

  return (
    <div className="page-header min-vh-100">
      <div className="container">
        <div className="row">
          <div className="col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-auto">
            <div className="card card-plain card-sign-in">
              <Image
                src="logo-sixbridge.svg"
                alt="SixBridge - El puente del ahorro"
                className="logo-sixbridge mb-2 mt-5 col-8 mx-auto"
                width={300}
                height={97}
              />
              <div className="card-header pb-0 text-start">
                <h4 className="font-weight-bolder">Ingresar</h4>
                <p className="mb-0">
                  Escriba su correo electrónico y contraseña para iniciar
                  sesión.
                </p>
              </div>
              <div className="card-body">
                <form role="form" onSubmit={formik.handleSubmit}>
                  <div className="mb-3">
                    <input
                      id="email"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Correo electrónico"
                      aria-label="Email"
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
                    <input
                      id="password"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Contraseña"
                      aria-label="Password"
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
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Recuérdame
                    </label>
                  </div>
                  <div className="text-center">
                    <input
                      type="submit"
                      id="loginButton"
                      className="btn btn-lg btn-primary btn-lg w-100 mt-4 mb-0"
                      value="Ingresar"
                    />
                    {mensaje && mostrarMensaje()}
                  </div>
                </form>
              </div>
              <div className="card-footer text-center pt-0 px-lg-2 px-1">
                <p className="mb-4 text-sm mx-auto">
                  Aún no eres parte de SixBridge?{" "}
                  <a
                    href="javascript:;"
                    className="text-primary text-gradient font-weight-bold"
                  >
                    Postula aquí
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
