"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import { useMutation, gql } from "@apollo/client";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Definición de tipos completos
type Producto = {
  skuproducto: string;
  nombre: string;
  skuproveedor: string;
  sku?: string;
  costo: number;
  precio: number;
  existencia: number;
  descripcion: string | null;
  __typename?: string;
};

type ProductoInput = {
  skuproducto: string;
  skuproveedor: string;
  nombre: string;
  costo: number;
  precio: number;
  existencia: number;
  descripcion: string | null;
};

type ProductoError = {
  skuproducto: string;
  message: string;
};

type UpsertProductsResponse = {
  success: Producto[];
  errors: ProductoError[];
  __typename?: string;
};

type ObtenerProductosQueryResult = {
  obtenerProductos: Producto[];
};

type CSVProduct = {
  skuproveedor: string;
  skuproducto: string | number;
  nombre: string;
  costo: number;
  precio: number;
  existencia: number;
  descripcion?: string;
  __parsed_extra?: unknown[];
};

const UPSERT_PRODUCTS_MUTATION = gql`
  mutation UpsertProducts($productos: [ProductoInput!]!) {
    upsertProducts(productos: $productos) {
      success {
        skuproducto
        skuproveedor
        sku
        nombre
        costo
        precio
        existencia
        descripcion
      }
      errors {
        skuproducto
        message
      }
    }
  }
`;

const GET_PRODUCTS_QUERY = gql`
  query obtenerProductos {
    obtenerProductos {
      skuproducto
      nombre
      skuproveedor
      sku
      costo
      precio
      existencia
      descripcion
    }
  }
`;

const FormInventario = () => {
  const [file, setFile] = useState<File | null>(null);
  const [upsertProducts] = useMutation<{ upsertProducts: UpsertProductsResponse }>(UPSERT_PRODUCTS_MUTATION, {
    update: (cache, { data }) => {
      if (!data) return;

      const { upsertProducts } = data;
      
      if (upsertProducts.success && upsertProducts.success.length > 0) {
        try {
          const existingData = cache.readQuery<ObtenerProductosQueryResult>({ 
            query: GET_PRODUCTS_QUERY 
          });

          if (!existingData) return;

          const updatedProductsMap = new Map<string, Producto>();
          upsertProducts.success.forEach(producto => {
            updatedProductsMap.set(producto.skuproducto, producto);
          });

          const updatedProducts = existingData.obtenerProductos.map(product => {
            return updatedProductsMap.get(product.skuproducto) || product;
          });

          upsertProducts.success.forEach(product => {
            if (!updatedProducts.some(p => p.skuproducto === product.skuproducto)) {
              updatedProducts.push(product);
            }
          });

          cache.writeQuery<ObtenerProductosQueryResult>({
            query: GET_PRODUCTS_QUERY,
            data: {
              obtenerProductos: updatedProducts
            }
          });
        } catch (error) {
          console.error("Error updating Apollo cache:", error);
        }
      }
    },
    refetchQueries: [
      { query: GET_PRODUCTS_QUERY }
    ]
  });

  const router = useRouter();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Incompleto",
        text: "Por favor sube un archivo CSV para continuar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    Papa.parse<CSVProduct>(file, {
      header: true,
      dynamicTyping: true,
      complete: async (results) => {
        try {
          const productos: ProductoInput[] = results.data.map((producto) => {
            // Validar campos requeridos
            if (!producto.skuproveedor || !producto.skuproducto) {
              throw new Error(
                "skuproveedor and skuproducto are required for all products."
              );
            }

            return {
              skuproveedor: producto.skuproveedor,
              skuproducto: String(producto.skuproducto),
              nombre: producto.nombre,
              costo: producto.costo,
              precio: producto.precio,
              existencia: producto.existencia,
              descripcion: producto.descripcion || null,
            };
          });

          const { data } = await upsertProducts({ 
            variables: { productos },
            optimisticResponse: {
              upsertProducts: {
                success: productos.map(p => ({
                  ...p,
                  sku: "", // Valor por defecto para campos opcionales
                  __typename: "Producto"
                })),
                errors: [],
                __typename: "UpsertProductsResponse"
              }
            }
          });

          if (data?.upsertProducts.errors?.length) {
            Swal.fire({
              icon: "warning",
              title: "Advertencia",
              text: `Algunos productos no se pudieron importar correctamente. Errores: ${data.upsertProducts.errors
                .map((err) => `${err.skuproducto}: ${err.message}`)
                .join(", ")}`,
              confirmButtonText: "Aceptar",
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "Éxito",
              text: "Productos importados con éxito.",
              confirmButtonText: "Aceptar",
            }).then(()=>{
              router.push("/");
            });
          }
        } catch (error) {
          console.error("Error importing products:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al importar los productos, intente nuevamente. Si el problema persiste contacte a soporte técnico.",
            confirmButtonText: "Aceptar",
          });
        }
      },
    });
  };

  return (
    <div className="card-body">
      <div className="row">
        <div className="col-md-12">
          <div className="pb-0">
            <h3>Inventario</h3>
          </div>
          <h6>Importar productos</h6>
          <p>
            Aquí puedes importar un archivo CSV con la información de los
            productos. Asegúrate de que el archivo tenga el formato correcto.
          </p>
          <div className="alert alert-info text-sm mb-4 text-white" role="alert">
            <i className="fas fa-info-circle me-2"></i> El archivo debe incluir
            las columnas:{" "}
            <strong>
              skuproveedor, skuproducto, nombre, costo, precio, existencia, descripcion
            </strong>.
          </div>
          <input
            className="form-control mb-3"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />

          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary me-2"
              onClick={handleImport}
            >
              <i className="bi bi-cloud-arrow-up"></i> Importar
            </button>
            <button type="reset" className="btn btn-secondary me-2">
              <i className="bi bi-eraser"></i> Limpiar
            </button>
            <Link href="/catalogos" className="btn btn-info">
              <i className="bi bi-card-list"></i> Ver Catálogos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormInventario;