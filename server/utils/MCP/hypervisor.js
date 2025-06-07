const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { uid } = require("uid");

class MCPHypervisor {
  constructor() {
    this.mcpServerConfigs = [];
    this.mcpLoadingResults = {};
    this.mcps = {};
    this._loadMcpServerConfigs();
  }

  log(text, ...args) {
    console.log(`\x1b[34m[MCP-Hypervisor]\x1b[0m ${text}`, ...args);
  }

  _loadMcpServerConfigs() {
    const configFile = path.resolve(
      __dirname,
      "../../storage/plugins/axon_mcp_servers.json"
    );
    try {
      if (fs.existsSync(configFile)) {
        const fileContent = fs.readFileSync(configFile, "utf8");
        if (fileContent) {
          const config = JSON.parse(fileContent);
          // Handle both new object format and old array format
          if (config.mcpServers && typeof config.mcpServers === 'object') {
            // Convert object format to array format
            this.mcpServerConfigs = Object.entries(config.mcpServers).map(([name, server]) => ({
              name,
              server
            }));
          } else if (Array.isArray(config)) {
            // Old array format
            this.mcpServerConfigs = config;
          } else {
            this.mcpServerConfigs = [];
          }
        } else {
          this.mcpServerConfigs = [];
        }
      } else {
        this.mcpServerConfigs = [];
      }
    } catch (e) {
      this.log(
        "Error loading MCP server config, file is likely malformed.",
        e.message
      );
      this.mcpServerConfigs = [];
    }
  }

  async readConfig() {
    return this.mcpServerConfigs;
  }

  async writeConfig(newConfig = "{}") {
    let content;
    try {
      content = JSON.parse(newConfig);
    } catch (e) {
      throw new Error("Invalid JSON provided for MCP config.");
    }
    const configFile = path.resolve(
      __dirname,
      "../../storage/plugins/axon_mcp_servers.json"
    );
    fs.writeFileSync(configFile, JSON.stringify(content, null, 2), {
      encoding: "utf-8",
    });
    this._loadMcpServerConfigs();
  }

  async reloadMCPServers() {
    this.log("Reloading MCP servers...");
    this._killAllMCPServers();
    this._loadMcpServerConfigs();
    await this.bootMCPServers();
  }

  async bootMCPServers() {
    if (!Array.isArray(this.mcpServerConfigs) || this.mcpServerConfigs.length === 0) {
      this.log("No MCP servers to boot.");
      return;
    }
    this.log(`Found ${this.mcpServerConfigs.length} MCP servers to boot.`);
    for (const serverConfig of this.mcpServerConfigs) {
      await this.startMCPServer(serverConfig.name);
    }
  }

  async startMCPServer(name) {
    const server = this.mcpServerConfigs.find((s) => s.name === name);
    if (!server) {
      this.log(`MCP server ${name} not found in config file.`);
      return { success: false, error: "Server not found in config" };
    }

    const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
    const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
    
    const mcpId = uid();
    
    const transport = new StdioClientTransport({
      command: server.server.command,
      args: server.server.args,
      env: { ...process.env, ...server.server.env },
    });

    const mcp = new Client({
      name: "AnythingLLM-MCP-Client",
      version: "1.0.0",
    }, {
      capabilities: {},
    });

    // Handle transport events
    transport.onerror = (error) => {
      this.log(`[${name} transport error]: ${error.toString()}`);
    };

    transport.onclose = () => {
      this.log(`[${name} transport closed]`);
    };

    this.mcps[name] = mcp;
    
    try {
      await mcp.connect(transport);
      this.log(`MCP server connected: ${name}`);
      this.mcpLoadingResults[name] = { status: "connected", message: null };
      return { success: true, error: null };
    } catch (error) {
      this.log(`Failed to connect to MCP server: ${name}`, error.message);
      this.mcpLoadingResults[name] = {
        status: "failed",
        message: error.message,
      };
      return { success: false, error: error.message };
    }
  }

  pruneMCPServer(name) {
    const mcp = this.mcps[name];
    if (!mcp) return true;
    try {
      // Close the MCP client connection
      mcp.close();
      delete this.mcps[name];
      delete this.mcpLoadingResults[name];
      return true;
    } catch (e) {
      this.log(`Error closing MCP server ${name}:`, e.message);
      return false;
    }
  }

  removeMCPServerFromConfig(name) {
    // Convert array back to object format for storage
    const mcpServers = {};
    this.mcpServerConfigs
      .filter((s) => s.name !== name)
      .forEach((s) => {
        mcpServers[s.name] = s.server;
      });
    
    const newConfig = { mcpServers };
    const configFile = path.resolve(
      __dirname,
      "../../storage/plugins/axon_mcp_servers.json"
    );
    fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2), {
      encoding: "utf-8",
    });
    this._loadMcpServerConfigs();
  }

  _killAllMCPServers() {
    for (const name in this.mcps) this.pruneMCPServer(name);
  }
}

module.exports = MCPHypervisor; 