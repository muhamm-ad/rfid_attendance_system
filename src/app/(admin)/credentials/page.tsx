// @/app/(admin)/credentials/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";

type ApiKeyItem = {
  id: string;
  name: string;
  key_prefix: string;
  lastUsed: string | null;
  createdAt: string;
};

export default function CredentialsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [jwtToken, setJwtToken] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchApiKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/keys", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      } else {
        setApiKeys([]);
      }
    } catch {
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const generateApiKey = async () => {
    const name = prompt("Nom de la clé ?")?.trim() || "API Key";
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erreur lors de la création de la clé");
      return;
    }
    alert(
      `Votre clé API (à enregistrer, elle ne sera plus affichée) :\n\n${data.apiKey}`,
    );
    fetchApiKeys();
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Révoquer cette clé ? Elle ne pourra plus être utilisée.")) return;
    const res = await fetch(`/api/keys/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      fetchApiKeys();
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de la révocation");
    }
  };

  const generateJWT = async () => {
    const expiresIn = prompt("Durée de validité ?", "30d") || "30d";
    const res = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ expiresIn }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erreur lors de la génération du JWT");
      return;
    }
    setJwtToken(data.token);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des identifiants</h1>

      {/* Section API Keys */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">API Keys</h2>
        <p className="text-gray-600 mb-4">
          Pour scripts, CLI, automatisations. Clés permanentes et révocables.
        </p>
        <button
          onClick={generateApiKey}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Générer une API Key
        </button>

        <div className="mt-4">
          {loading ? (
            <p className="text-gray-500">Chargement…</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-gray-500">Aucune clé API.</p>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="border p-3 mb-2 rounded flex items-center justify-between">
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{key.key_prefix}…</p>
                  <p className="text-sm text-gray-500">
                    Dernière utilisation :{" "}
                    {key.lastUsed
                      ? new Date(key.lastUsed).toLocaleString()
                      : "Jamais"}
                  </p>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Révoquer
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section JWT */}
      <section>
        <h2 className="text-xl font-semibold mb-4">JWT Tokens</h2>
        <p className="text-gray-600 mb-4">
          Pour applications mobiles, SPAs externes. Tokens temporaires avec
          expiration.
        </p>
        <button
          onClick={generateJWT}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Générer un JWT
        </button>

        {jwtToken && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="font-mono text-sm break-all">{jwtToken}</p>
            <button
              onClick={() => navigator.clipboard.writeText(jwtToken)}
              className="mt-2 text-blue-500 hover:underline"
            >
              Copier
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
