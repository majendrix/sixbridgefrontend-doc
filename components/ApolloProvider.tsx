"use client";

import React from "react";
import { ApolloProvider as Provider } from "@apollo/client";
import client from "../config/apollo";
import { ErrorBoundary } from "react-error-boundary";

const ApolloProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong!</div>}>
      <Provider client={client}>{children}</Provider>
    </ErrorBoundary>
  );
};

export default ApolloProvider;
