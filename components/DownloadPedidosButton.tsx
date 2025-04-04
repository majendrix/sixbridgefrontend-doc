import { useState } from "react";

const DownloadPedidosButton = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    // Get the token and user from localStorage
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user?.role !== "administrador") {
      alert("You do not have permission to download this file.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/graphql",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send the token
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pedidos.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Error downloading CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-primary"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? "Downloading..." : "Download Pedidos CSV"}
    </button>
  );
};

export default DownloadPedidosButton;
