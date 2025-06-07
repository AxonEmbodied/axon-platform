const { reqBody } = require("../utils/http");
const MCPCompatibilityLayer = require("../utils/MCP");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

function mcpServersEndpoints(app) {
  if (!app) return;

  app.get(
    "/mcp-servers/config",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_request, response) => {
      try {
        const config = await new MCPCompatibilityLayer().readConfig();
        return response.status(200).json({
          success: true,
          error: null,
          config,
        });
      } catch (error) {
        console.error("Error reading MCP config:", error);
        return response.status(500).json({
          success: false,
          error: error.message,
          config: null,
        });
      }
    }
  );

  app.post(
    "/mcp-servers/config",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { config } = reqBody(request);
        const mcp = new MCPCompatibilityLayer();
        await mcp.writeConfig(config);
        await mcp.reloadMCPServers();
        return response.status(200).json({
          success: true,
          error: null,
        });
      } catch (error) {
        console.error("Error writing MCP config:", error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  app.get(
    "/mcp-servers/discover",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const csvPath = path.resolve(
          __dirname,
          "../../notebooks/mcps_data.csv"
        );
        if (!fs.existsSync(csvPath)) {
          return response.status(404).json({
            success: false,
            error: "Discovery file mcps_data.csv not found.",
            servers: [],
          });
        }

        const fileContent = fs.readFileSync(csvPath, "utf-8");
        let records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
        });

        // Hot-swap modelcontextprotocol/servers to modelcontextprotocol/servers-archived
        const oldUrlPart = "github.com/modelcontextprotocol/servers/";
        const newUrlPart = "github.com/modelcontextprotocol/servers-archived/";
        records = records.map((server) => {
          if (server.link && server.link.includes(oldUrlPart)) {
            return { ...server, link: server.link.replace(oldUrlPart, newUrlPart) };
          }
          return server;
        });

        // Get search parameters
        const { search = "", searchInDescription = "false" } = request.query;
        const shouldSearchDescription = searchInDescription === "true";

        // Apply server-side filtering if search query is provided
        if (search && search.trim() !== "") {
          const searchQuery = search.toLowerCase().trim();
          records = records.filter((server) => {
            const nameMatch = server.name && server.name.toLowerCase().includes(searchQuery);
            if (shouldSearchDescription) {
              const descriptionMatch = server.description && server.description.toLowerCase().includes(searchQuery);
              return nameMatch || descriptionMatch;
            }
            return nameMatch;
          });
        }

        return response.status(200).json({
          success: true,
          error: null,
          servers: records,
        });
      } catch (error) {
        console.error("Error discovering MCP servers:", error);
        return response.status(500).json({
          success: false,
          error: error.message,
          servers: [],
        });
      }
    }
  );

  app.get(
    "/mcp-servers/force-reload",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_request, response) => {
      try {
        const mcp = new MCPCompatibilityLayer();
        await mcp.reloadMCPServers();
        return response.status(200).json({
          success: true,
          error: null,
          servers: await mcp.servers(),
        });
      } catch (error) {
        console.error("Error force reloading MCP servers:", error);
        return response.status(500).json({
          success: false,
          error: error.message,
          servers: [],
        });
      }
    }
  );

  app.get(
    "/mcp-servers/list",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_request, response) => {
      try {
        const servers = await new MCPCompatibilityLayer().servers();
        return response.status(200).json({
          success: true,
          servers,
        });
      } catch (error) {
        console.error("Error listing MCP servers:", error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  app.post(
    "/mcp-servers/toggle",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { name } = reqBody(request);
        const result = await new MCPCompatibilityLayer().toggleServerStatus(
          name
        );
        return response.status(200).json({
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        console.error("Error toggling MCP server:", error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  app.post(
    "/mcp-servers/delete",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { name } = reqBody(request);
        const result = await new MCPCompatibilityLayer().deleteServer(name);
        return response.status(200).json({
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        console.error("Error deleting MCP server:", error);
        return response.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );
}

module.exports = { mcpServersEndpoints };
