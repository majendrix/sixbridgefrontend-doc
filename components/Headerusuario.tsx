"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Usamos useRouter en lugar de redirect
import { useQuery, gql } from "@apollo/client";

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

export default function HeaderUsuario() {
  const [isClient, setIsClient] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const router = useRouter();

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apollo query
  const { data, loading, error, startPolling, stopPolling } = useQuery(
    OBTENER_USUARIO,
    {
      // Skip the query during SSR
      skip: !isClient,
    }
  );

  console.log("Rendering HeaderUsuario component");
  console.log("Loading state:", loading);
  console.log("Error:", error);
  console.log("User data:", data?.obtenerUsuario);

  useEffect(() => {
    if (!isClient) return; // Don't run effects during SSR

    console.log("Starting polling to check authentication status");
    startPolling(5000); // Poll every 5 seconds

    return () => {
      console.log("Stopping polling (component unmounting)");
      stopPolling();
    };
  }, [startPolling, stopPolling, isClient]);

  useEffect(() => {
    if (!isClient) return; // Don't run effects during SSR

    console.log("Checking authentication status in useEffect");
    if (!loading && (error || !data?.obtenerUsuario)) {
      console.log("User is not authenticated. Preparing to redirect...");

      const hideTimer = setTimeout(() => {
        console.log("Hiding message");
        setShowMessage(false);
      }, 1000);

      const redirectTimer = setTimeout(() => {
        console.log("Redirecting to login page");
        router.push("/login"); // Usamos router.push en lugar de redirect
      }, 2000);

      return () => {
        console.log("Cleaning up timers");
        clearTimeout(hideTimer);
        clearTimeout(redirectTimer);
      };
    }
  }, [loading, data, error, isClient, router]);

  // Return null during SSR or loading
  if (!isClient || loading) return null;

  if (loading) {
    console.log("Loading user data...");
    return null;
  }

  if (error) {
    console.log("Error fetching user data:", error);
    return null;
  }

  if (!data?.obtenerUsuario) {
    console.log("No user data found. User is not authenticated.");
    return null;
  }

  const { nombre, role } = data.obtenerUsuario;
  console.log("User is authenticated:", nombre, role);

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-primary bg-primary text-white col-12 justify-content-end ${
        showMessage ? "" : "d-none"
      }`}
    >
      <p className="mx-4 mb-0 text-xs">
        {role === "administrador"
          ? `Bienvenido, ${nombre}`
          : role === "vendedor"
          ? `Bienvenido, ${nombre}`
          : `Hola, ${nombre}`}
      </p>
    </nav>
  );
}
