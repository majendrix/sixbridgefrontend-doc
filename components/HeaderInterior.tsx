"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const HeaderInterior = () => {
  return (
    <div className="wrap">
      <header className="bg-white text-black mb-4">
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
            <ul className="navbar-nav justify-content-start">
              <li className="nav-item d-xl-none d-flex align-items-center">
                <button className="nav-link p-0" id="iconNavbarSidenav">
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
              className="logo-sixbridge d-block d-sm-none col-6 float-none"
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
    </div>
  );
};
export default HeaderInterior;
