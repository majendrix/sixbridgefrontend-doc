"use client"; // Esto asegura que Formik se ejecute solo en el cliente
import Botonera from "../../components/Botonera";
import HeaderInterior from "../../components/HeaderInterior";
import Producto from "../../components/Producto";
import { gql, useQuery } from "@apollo/client";

const OBTENER_PRODUCTOS = gql`
  query obtenerProductos {
    obtenerProductos {
      id
      nombre
      existencia
      descripcion
      formato
      precio
      sku
      skuproveedor
    }
  }
`;

interface Producto {
  id: string;
  nombre: string;
  existencia: number;
  precio: number;
  costo: number;
  skuproveedor: string;
  skuproducto: string;
  sku: string;
  descripcion: string;
  formato: string;
  creado: string;
}

const Productos = () => {
  // Consulta Apollo
  const { data, loading, error } = useQuery(OBTENER_PRODUCTOS);

  // Manejo de estados
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  console.log(data);
  console.log(loading);
  console.log(error);

  return (
    <div className="wrap">
      <HeaderInterior />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header pb-0 d-flex justify-content-between justify-content-center">
                <h6>Catálogo de productos</h6>
                <button id="printButton" className="btn btn-icon btn-primary">
                  <span className="btn-inner--text">Descargar</span>
                  <span className="btn-inner--icon">
                    <i className="fa-solid fa-download"></i>
                  </span>
                </button>
              </div>
              <div className="card-body px-0 pt-0 pb-2">
                <ul className="list-group">
                  {data?.obtenerProductos?.map((producto: Producto) => (
                    <Producto key={producto.id} producto={producto} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Botonera />
      </div>
    </div>
  );
};

export default Productos;
