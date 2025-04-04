"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, gql, useApolloClient } from "@apollo/client";
import Image from "next/image";
import { Offcanvas } from "react-bootstrap";

const OBTENER_USUARIO = gql`
  query obtenerUsuario {
    obtenerUsuario {
      id
      nombre
      email
      role
    }
  }
`;

const Sidebar = () => {
  const { data, loading, error } = useQuery(OBTENER_USUARIO);
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const client = useApolloClient();

  // Initialize state for user role
  const [role, setRole] = React.useState<string | null>(null);

  // Update role when data is available
  useEffect(() => {
    if (data?.obtenerUsuario) {
      setRole(data.obtenerUsuario.role);
      console.log("role: ", role);
    } else {
      setRole(null); // No user data means the user is logged out
      console.log("role: ", role);
    }
  }, [data, role]);

  const cerrarSesion = async () => {
    setRole(null);
    setShow(false);
    localStorage.removeItem("token");
    await client.clearStore();
    window.location.href = "/login";
    console.log("role: ", role);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Show loading state while data is being fetched
  if (loading) return <p>Cargando Usuario...</p>;
  if (error) return null;

  // If there's no user data, don't render the sidebar
  if (!role) return null;

  console.log("role final: ", role);

  return (
    <>
      {/* Sidebar para escritorio */}
      <div className="d-none d-lg-block col-lg-2">
        <div className="sidenav bg-white navbar navbar-vertical navbar-expand-xs border-0 fixed-start bg-light">
          <div className="sidenav-header">
            <Link className="navbar-brand m-0" href="/" passHref>
              <Image
                src="/logo-sixbridge.svg"
                alt="SixBridge - El puente del ahorro"
                className="logo-sixbridge"
                width={300}
                height={97}
              />
            </Link>
            <hr className="horizontal dark mt-0" />
          </div>
          <div
            className="collapse-sixbridge navbar-collapse w-auto"
            id="sidenav-collapse-main"
          >
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link
                  className={pathname === "/" ? "nav-link active" : "nav-link"}
                  href="/"
                  passHref
                >
                  <div
                    onClick={handleClose}
                    className="d-flex align-items-center"
                  >
                    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-box text-dark text-sm opacity-10"></i>
                    </div>
                    <span className="nav-link-text ms-1">Escritorio</span>
                  </div>
                </Link>
              </li>
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/inventario"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/inventario"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-archive text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Inventario</span>
                    </div>
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link
                  className={
                    pathname === "/catalogos" ? "nav-link active" : "nav-link"
                  }
                  href="/catalogos"
                  passHref
                >
                  <div
                    onClick={handleClose}
                    className="d-flex align-items-center"
                  >
                    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-journal-arrow-down text-dark text-sm opacity-10"></i>
                    </div>
                    <span className="nav-link-text ms-1">Catálogos</span>
                  </div>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={
                    pathname === "/pedidos" ? "nav-link active" : "nav-link"
                  }
                  href="/pedidos"
                  passHref
                >
                  <div
                    onClick={handleClose}
                    className="d-flex align-items-center"
                  >
                    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-shop text-dark text-sm opacity-10"></i>
                    </div>
                    <span className="nav-link-text ms-1">Pedidos</span>
                  </div>
                </Link>
              </li>
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/proveedores"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/proveedores"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-square text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Proveedores</span>
                    </div>
                  </Link>
                </li>
              )}
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/vendedores"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/vendedores"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-person text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Vendedores</span>
                    </div>
                  </Link>
                </li>
              )}
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/comisiones"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/comisiones"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-currency-dollar text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Comisiones</span>
                    </div>
                  </Link>
                </li>
              )}
              {role === "vendedor" && (
                <li className="nav-item">
                  <Link className="nav-link " href="/nuevopedido" passHref>
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-cart-plus text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Nuevo pedido</span>
                    </div>
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link
                  className={
                    pathname === "/clientes" ? "nav-link active" : "nav-link"
                  }
                  href="/clientes"
                  passHref
                >
                  <div
                    onClick={handleClose}
                    className="d-flex align-items-center"
                  >
                    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-person-square text-dark text-sm opacity-10"></i>
                    </div>
                    <span className="nav-link-text ms-1">Clientes</span>
                  </div>
                </Link>
              </li>
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/costosenvio"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/costosenvio"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-truck text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">
                        Costos de envío
                      </span>
                    </div>
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => {
                    cerrarSesion();
                  }}
                  type="button"
                >
                  <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                    <i className="bi bi-power text-dark text-sm opacity-10"></i>
                  </div>
                  <span className="nav-link-text ms-1">Salir</span>
                </button>
              </li>
            </ul>
          </div>
          <div className="sidenav-footer mx-3">
            <div className="card card-plain shadow-none" id="sidenavCard">
              <Image
                className="w-30 mx-auto"
                src="/assets/img/illustrations/icon-documentation.svg"
                alt="Documentación"
                width={200}
                height={141}
              />
              <div className="card-body text-center p-3 w-100 pt-0">
                <div className="docs-info">
                  <h6 className="mb-0">Necesitas ayuda?</h6>
                </div>
              </div>
            </div>
            <Link
              href="#"
              target="_blank"
              className="btn btn-dark btn-sm w-100 mb-3"
            >
              Whatsapp
            </Link>
            <Link
              href="#"
              target="_blank"
              className="btn btn-primary btn-sm mb-0 w-100"
            >
              Contacto soporte
            </Link>
          </div>
        </div>
      </div>

      {/* Offcanvas para móviles */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        className="d-lg-none"
        placement="start"
      >
        <div className="sidenav bg-white navbar navbar-vertical navbar-expand-xs border-0 fixed-start bg-light">
          <div className="sidenav-header">
            <button type="button" className="btn-close" onClick={handleClose}>
              <i className="bi bi-x p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0"></i>
            </button>
            <Link className="navbar-brand m-0" href="/" passHref>
              <Image
                src="/logo-sixbridge.svg"
                alt="SixBridge - El puente del ahorro"
                className="logo-sixbridge"
                width={300}
                height={97}
              />
            </Link>
            <hr className="horizontal dark mt-0" />
          </div>
          <div
            className="collapse-sixbridge navbar-collapse w-auto"
            id="sidenav-collapse-main"
          >
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link
                  className={pathname === "/" ? "nav-link active" : "nav-link"}
                  href="/"
                  passHref
                >
                  <div
                    onClick={handleClose}
                    className="d-flex align-items-center"
                  >
                    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-box text-dark text-sm opacity-10"></i>
                    </div>
                    <span className="nav-link-text ms-1">Escritorio</span>
                  </div>
                </Link>
              </li>
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/inventario"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/inventario"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-archive text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Inventario</span>
                    </div>
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link
                  className={
                    pathname === "/catalogos" ? "nav-link active" : "nav-link"
                  }
                  href="/catalogos"
                  passHref
                >
                  <div
                    onClick={handleClose}
                    className="d-flex align-items-center"
                  >
                    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-journal-arrow-down text-dark text-sm opacity-10"></i>
                    </div>
                    <span className="nav-link-text ms-1">Catálogos</span>
                  </div>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={
                    pathname === "/pedidos" ? "nav-link active" : "nav-link"
                  }
                  href="/pedidos"
                  passHref
                >
                  <div
                    onClick={handleClose}
                    className="d-flex align-items-center"
                  >
                    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-shop text-dark text-sm opacity-10"></i>
                    </div>
                    <span className="nav-link-text ms-1">Pedidos</span>
                  </div>
                </Link>
              </li>
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/proveedores"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/proveedores"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-person-square text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Proveedores</span>
                    </div>
                  </Link>
                </li>
              )}
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/vendedores"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/vendedores"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-person text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Vendedores</span>
                    </div>
                  </Link>
                </li>
              )}
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/comisiones"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/comisiones"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-currency-dollar text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Comisiones</span>
                    </div>
                  </Link>
                </li>
              )}
              {role === "vendedor" && (
                <li className="nav-item">
                  <Link className="nav-link " href="/nuevopedido" passHref>
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-cart-plus text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">Nuevo pedido</span>
                    </div>
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link
                  className={
                    pathname === "/clientes" ? "nav-link active" : "nav-link"
                  }
                  href="/clientes"
                  passHref
                >
                  <div
                    onClick={handleClose}
                    className="d-flex align-items-center"
                  >
                    <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-person-square text-dark text-sm opacity-10"></i>
                    </div>
                    <span className="nav-link-text ms-1">Clientes</span>
                  </div>
                </Link>
              </li>
              {role === "administrador" && (
                <li className="nav-item">
                  <Link
                    className={
                      pathname === "/costosenvio"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    href="/costosenvio"
                    passHref
                  >
                    <div
                      onClick={handleClose}
                      className="d-flex align-items-center"
                    >
                      <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                        <i className="bi bi-truck text-dark text-sm opacity-10"></i>
                      </div>
                      <span className="nav-link-text ms-1">
                        Costos de envío
                      </span>
                    </div>
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => {
                    cerrarSesion();
                  }}
                  type="button"
                >
                  <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                    <i className="bi bi-power text-dark text-sm opacity-10"></i>
                  </div>
                  <span className="nav-link-text ms-1">Salir</span>
                </button>
              </li>
            </ul>
          </div>
          <div className="sidenav-footer mx-3">
            <div className="card card-plain shadow-none" id="sidenavCard">
              <Image
                className="w-30 mx-auto"
                src="/assets/img/illustrations/icon-documentation.svg"
                alt="Documentación"
                width={200}
                height={141}
              />
              <div className="card-body text-center p-3 w-100 pt-0">
                <div className="docs-info">
                  <h6 className="mb-0">Necesitas ayuda?</h6>
                </div>
              </div>
            </div>
            <Link
              href="#"
              target="_blank"
              className="btn btn-dark btn-sm w-100 mb-3"
            >
              Whatsapp
            </Link>
            <Link
              href="#"
              target="_blank"
              className="btn btn-primary btn-sm mb-0 w-100"
            >
              Contacto soporte
            </Link>
          </div>
        </div>
      </Offcanvas>

      <header className="col-lg-10 offset-lg-2 bg-white text-black mb-4 d-xl-none">
        <nav
          className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl "
          id="navbarBlur"
        >
          <div className="container-fluid py-1 px-3">
            <nav className="d-none d-xl-block">
              <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                <li className="breadcrumb-item text-sm">
                  <Link href="/">Volver</Link>
                </li>
              </ol>
            </nav>
            <ul className="navbar-nav justify-content-start me-3">
              <li className="nav-item d-xl-none d-flex align-items-center">
                <button
                  className="nav-link p-0"
                  id="iconNavbarSidenav"
                  onClick={handleShow}
                >
                  <div className="sidenav-toggler-inner">
                    <i className="sidenav-toggler-line bg-primary"></i>
                    <i className="sidenav-toggler-line bg-primary"></i>
                    <i className="sidenav-toggler-line bg-primary"></i>
                  </div>
                </button>
              </li>
            </ul>
            <Image
              src="logo-sixbridge.svg"
              alt="SixBridge - El puente del ahorro"
              className="logo-sixbridge d-block col-6 col-sm-2 float-none"
              width={300}
              height={97}
            />
            <div
              className=" navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4 col-12"
              id="navbar"
            >
              <nav className="d-flex d-xl-none col-11">
                <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                  <li className="breadcrumb-item text-sm">
                    <Link href="/">Volver</Link>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Sidebar;
