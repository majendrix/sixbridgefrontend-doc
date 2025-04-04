import React, { useState } from "react";
import Select from "react-select";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Proveedor } from "../NuevoPedido";

// Consulta para obtener proveedores
const GET_PROVEEDORES = gql`
  query obtenerProveedores {
    obtenerProveedores {
      id
      nombre
      rut
      codigo
      telefono
      direccioncalle
      estado
    }
  }
`;

interface ProveedorOption {
  value: string;
  label: string;
}

const SeleccionarProveedor = ({
  onProveedorSeleccionado,
}: {
  onProveedorSeleccionado: (proveedor: Proveedor) => void;
}) => {
  const { data, loading, error } = useQuery(GET_PROVEEDORES);
  const [selectedOption, setSelectedOption] = useState<ProveedorOption | null>(
    null
  );

  if (loading) return <p>Cargando proveedores...</p>;
  if (error) return <p>Error al cargar proveedores.</p>;

  if (!data || !data.obtenerProveedores)
    return <p>No hay proveedores disponibles</p>;

  // Filtrar proveedores con estado: true
  const proveedoresFiltrados = data.obtenerProveedores.filter(
    (proveedor: { estado: boolean }) => proveedor.estado === true
  );

  const opciones = proveedoresFiltrados.map(
    (proveedor: { id: string; nombre: string }) => ({
      value: proveedor.id,
      label: proveedor.nombre,
    })
  );

  const handleChange = (selected: ProveedorOption | null) => {
    setSelectedOption(selected);
    if (selected) {
      const proveedorSeleccionado = data.obtenerProveedores.find(
        (proveedor: { id: string }) => proveedor.id === selected.value
      );
      onProveedorSeleccionado(proveedorSeleccionado); // Enviar datos completos
    }
  };

  return (
    <div className="mb-3">
      <label className="text-sm">Selecciona un proveedor</label>
      <Select
        options={opciones}
        value={selectedOption}
        onChange={handleChange}
        placeholder="Buscar proveedor..."
      />
    </div>
  );
};

export default SeleccionarProveedor;
