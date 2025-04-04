import React, { useState } from "react";
import Select from "react-select";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Cliente } from "../NuevoPedido";

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

interface ClienteOption {
  value: string;
  label: string;
}

const SeleccionarCliente = ({
  onClienteSeleccionado,
}: {
  onClienteSeleccionado: (cliente: Cliente) => void;
}) => {
  const { data, loading, error } = useQuery(GET_CLIENTES, {
    variables: {
      limit: 10, // Asegúrate de que coincida con las variables de la mutación
      offset: 0,
    },
    fetchPolicy: "cache-and-network", // Asegura que el componente reaccione a las actualizaciones del caché
  });

  const [selectedOption, setSelectedOption] = useState<ClienteOption | null>(
    null
  );

  if (loading) return <p>Cargando clientes...</p>;
  if (error) return <p>Error al cargar clientes.</p>;

  if (!data || !data.obtenerClientesVendedorTodos)
    return <p>No hay clientes disponibles</p>;

  const opciones = data.obtenerClientesVendedorTodos.map(
    (cliente: { id: string; nombre: string }) => ({
      value: cliente.id,
      label: cliente.nombre,
    })
  );

  const handleChange = (selected: ClienteOption | null) => {
    setSelectedOption(selected);
    if (selected) {
      const clienteSeleccionado = data.obtenerClientesVendedorTodos.find(
        (cliente: { id: string }) => cliente.id === selected.value
      );
      onClienteSeleccionado(clienteSeleccionado); // Enviar datos completos
    }
  };

  return (
    <div className="mb-3">
      <label className="text-sm">Selecciona un cliente</label>
      <Select
        options={opciones}
        value={selectedOption}
        onChange={handleChange}
        placeholder="Buscar cliente..."
      />
    </div>
  );
};

export default SeleccionarCliente;
