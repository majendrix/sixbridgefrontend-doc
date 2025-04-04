export interface Producto {
  skuproveedor: string;
  id: string;
  nombre: string;
  sku: string;
  descripcion: string;
  formato: string;
  precio: number;
  existencia: number;
  cantidad: number;
  subtotal: number;
}
export interface PedidoType {
  id: string;
  pedido: {
    id: string;
    cantidad: number;
  };
  cliente: {
    id: string;
    nombre: string;
    email: string;
    direccionnumero: string;
  };
  total: number;
  estado: string;
  creado: string;
  numeropedido: string;
  proveedor: {
    id: string;
    nombre: string;
    email: string;
    codigo: string;
    comision: number;
  };
  comisionPagada: boolean;
}
