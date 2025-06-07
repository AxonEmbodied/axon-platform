import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const MCPServers = {
  /**
   * Forces a reload of the MCP Hypervisor and its servers
   * @returns {Promise<{success: boolean, error: string | null, servers: Array<{name: string, running: boolean, tools: Array<{name: string, description: string, inputSchema: Object}>, error: string | null, process: {pid: number, cmd: string} | null}>}>}
   */
  forceReload: async () => {
    return await fetch(`${API_BASE}/mcp-servers/force-reload`, {
      method: "GET",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => ({
        servers: [],
        success: false,
        error: e.message,
      }));
  },

  /**
   * List all available MCP servers in the system
   * @returns {Promise<{success: boolean, error: string | null, servers: Array<{name: string, running: boolean, tools: Array<{name: string, description: string, inputSchema: Object}>, error: string | null, process: {pid: number, cmd: string} | null}>}>}
   */
  listServers: async () => {
    return await fetch(`${API_BASE}/mcp-servers/list`, {
      method: "GET",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => ({
        success: false,
        error: e.message,
        servers: [],
      }));
  },

  /**
   * Toggle the MCP server (start or stop)
   * @param {string} name - The name of the MCP server to toggle
   * @returns {Promise<{success: boolean, error: string | null}>}
   */
  toggleServer: async (name) => {
    return await fetch(`${API_BASE}/mcp-servers/toggle`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .catch((e) => ({
        success: false,
        error: e.message,
      }));
  },

  /**
   * Delete the MCP server - will also remove it from the config file
   * @param {string} name - The name of the MCP server to delete
   * @returns {Promise<{success: boolean, error: string | null}>}
   */
  deleteServer: async (name) => {
    return await fetch(`${API_BASE}/mcp-servers/delete`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .catch((e) => ({
        success: false,
        error: e.message,
      }));
  },

  discoverServers: async function (search = "", searchInDescription = false) {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.append("search", search.trim());
    }
    if (searchInDescription) {
      params.append("searchInDescription", "true");
    }
    
    const url = `${API_BASE}/mcp-servers/discover${params.toString() ? `?${params.toString()}` : ""}`;
    
    return await fetch(url, {
      headers: baseHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not discover MCP servers.");
        return res.json();
      })
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message, servers: [] };
      });
  },

  addFromGithub: async function (url) {
    try {
      const response = await fetch(`${API_BASE}/mcp-servers/add-from-github`, {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add MCP server from GitHub.");
      }
      return data;
    } catch (e) {
      console.error(e);
      return { success: false, error: e.message };
    }
  },

  addSpecificServer: async function (config) {
    try {
      const response = await fetch(
        `${API_BASE}/mcp-servers/add-specific-config`,
        {
          method: "POST",
          headers: baseHeaders(),
          body: JSON.stringify({ config }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add MCP server.");
      }
      return data;
    } catch (e) {
      console.error(e);
      return { success: false, error: e.message };
    }
  },

  getConfig: async function () {
    return await fetch(`${API_BASE}/mcp-servers/config`, {
      headers: baseHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not get MCP config.");
        return res.json();
      })
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message, config: null };
      });
  },

  updateConfig: async function (config) {
    return await fetch(`${API_BASE}/mcp-servers/config`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ config }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not update MCP config.");
        return res.json();
      })
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message };
      });
  },

  updateServer: async function (name, updates) {
    try {
      const response = await fetch(`${API_BASE}/mcp-servers/update/${name}`, {
        method: 'POST',
        headers: baseHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update MCP server.');
      }
      return data;
    } catch (e) {
      console.error(e);
      return { success: false, error: e.message };
    }
  },
};

export default MCPServers;
