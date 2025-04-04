import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/graphql",
  credentials: "include", // Importante para cookies y autenticación
  headers: {
    "Content-Type": "application/json",
  },
});

const authLink = setContext((_, { headers }) => {
  // Para Next.js, es mejor usar cookies o el contexto de la aplicación
  // ya que localStorage no está disponible en el servidor
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  connectToDevTools: true,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          obtenerUsuariosPorRol: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming]; // Orden corregido
            },
          },
        },
      },
    },
  }),
  link: authLink.concat(httpLink),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default client;
