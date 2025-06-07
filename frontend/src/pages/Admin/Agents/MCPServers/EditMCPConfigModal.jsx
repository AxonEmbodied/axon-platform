import React, { useState, useEffect } from "react";
import { FullScreenLoader } from "@/components/Preloader";
import MCPServers from "@/models/mcpServers";
import showToast from "@/utils/toast";

export default function EditMCPConfigModal({ closeModal }) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState("[]");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      const { config: fetchedConfig, error } = await MCPServers.getConfig();
      if (error) {
        showToast("Could not load MCP server configuration.", "error");
        setConfig("[]");
      } else {
        setConfig(JSON.stringify(fetchedConfig, null, 2));
      }
      setLoading(false);
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      JSON.parse(config);
    } catch (e) {
      showToast("Invalid JSON. Please check your syntax.", "error");
      return;
    }

    const { success, error } = await MCPServers.updateConfig(config);
    if (success) {
      showToast("Configuration saved and MCP servers reloaded.", "success");
      closeModal();
    } else {
      showToast(error || "Failed to save configuration.", "error");
    }
  };

  const handleEditorChange = (e) => {
    setConfig(e.target.value);
    setHasChanges(true);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-bg-secondary p-6 rounded-lg shadow-lg w-full max-w-2xl text-white">
        <h2 className="text-lg font-bold mb-4">Edit MCP Servers Configuration</h2>
        <p className="text-sm text-white/60 mb-4">
          Directly edit the `axon_mcp_servers.json` file. Be careful, as
          invalid JSON will prevent servers from loading.
        </p>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <FullScreenLoader />
          </div>
        ) : (
          <textarea
            className="w-full h-96 p-2 rounded-lg bg-theme-bg-primary font-mono text-sm border border-white/20 focus:ring-2 focus:ring-sky-500"
            value={config}
            onChange={handleEditorChange}
          />
        )}
        <div className="mt-4 flex justify-end gap-x-2">
          <button
            className="px-4 py-2 rounded-lg bg-transparent border border-white/40 text-white hover:bg-white/10"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save and Reload Servers
          </button>
        </div>
      </div>
    </div>
  );
} 