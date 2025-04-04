"use client";
import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_DELIVERY_COST_RANGES = gql`
  query obtenerCostoEnvio {
    obtenerCostoEnvio {
      id
      minTotal
      maxTotal
      costo
    }
  }
`;

const ADD_DELIVERY_COST_RANGE = gql`
  mutation nuevoCostoEnvio($range: CostoEnvioInput!) {
    nuevoCostoEnvio(range: $range) {
      id
      minTotal
      maxTotal
      costo
    }
  }
`;

const DELETE_DELIVERY_COST_RANGE = gql`
  mutation eliminarCostoEnvio($id: ID!) {
    eliminarCostoEnvio(id: $id)
  }
`;

export default function DeliveryCostRanges() {
  const { loading, error, data, refetch } = useQuery(GET_DELIVERY_COST_RANGES);
  const [nuevoCostoEnvio] = useMutation(ADD_DELIVERY_COST_RANGE, {
    onCompleted: () => refetch(),
  });
  const [eliminarCostoEnvio] = useMutation(DELETE_DELIVERY_COST_RANGE, {
    onCompleted: () => refetch(),
  });

  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [costo, setDeliveryCost] = useState("");

  const handleAddRange = () => {
    nuevoCostoEnvio({
      variables: {
        range: {
          minTotal: parseFloat(minTotal),
          maxTotal: parseFloat(maxTotal),
          costo: parseFloat(costo),
        },
      },
    });
    setMinTotal("");
    setMaxTotal("");
    setDeliveryCost("");
  };

  const handleDeleteRange = (id) => {
    eliminarCostoEnvio({ variables: { id } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const ranges = data?.obtenerCostoEnvio || [];

  return (
    <div className="wrap">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header pb-0">
                <h5>Rangos de costos de envío</h5>
              </div>
              <div className="card-body">
                <div>
                  <h6>Agregar nuevos rangos</h6>
                  <div className="input-group mb-3">
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Min Total"
                      value={minTotal}
                      onChange={(e) => setMinTotal(e.target.value)}
                    />
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Max Total"
                      value={maxTotal}
                      onChange={(e) => setMaxTotal(e.target.value)}
                    />
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Costo"
                      value={costo}
                      onChange={(e) => setDeliveryCost(e.target.value)}
                    />
                    <button
                      className="btn btn-primary mb-0"
                      onClick={handleAddRange}
                    >
                      Agregar rango
                    </button>
                  </div>

                  <div className="col-12 col-md-6">
                    <h6>Rangos existentes</h6>
                    {ranges.length === 0 ? (
                      <p>Aún no existen rangos de costo de envío.</p>
                    ) : (
                      <ul className="list-group">
                        {ranges.map((range) => (
                          <li key={range.id} className="flex list-group-item">
                            <div className="col-8 float-start">
                              <p className="mb-0 mt-2">
                                De ${range.minTotal} a ${range.maxTotal}= $
                                {range.costo}
                              </p>
                            </div>
                            <button
                              className="col-4 btn btn-danger float-end mb-0"
                              onClick={() => handleDeleteRange(range.id)}
                            >
                              Eliminar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
