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
const axios = require("axios");
const JSON5 = require("json5");

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

        // De-duplicate records by 'id' to prevent React key warnings.
        const seen = new Set();
        const uniqueRecords = records.filter(el => {
          if (!el.id) return false; // Don't include records without an ID
          const duplicate = seen.has(el.id);
          seen.add(el.id);
          return !duplicate;
        });
        records = uniqueRecords;

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

  app.post(
    "/mcp-servers/add-from-github",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { url } = reqBody(request);
        if (!url || !url.includes("github.com")) {
          return response
            .status(400)
            .json({ success: false, error: "Invalid GitHub URL provided." });
        }

        // Parse GitHub URL to extract owner, repo, and path
        const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/[^\/]+\/(.+))?/;
        const match = url.match(githubUrlPattern);
        
        if (!match) {
          return response.status(400).json({ error: 'Invalid GitHub URL format' });
        }
        
        const [, owner, repo, subPath] = match;
        console.log(`Parsed GitHub URL - Owner: ${owner}, Repo: ${repo}, SubPath: ${subPath || 'root'}`);
        
        // Construct the raw GitHub URL for the README
        const baseRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}`;
        const pathPrefix = subPath ? `/${subPath}` : '';
        
        // Try different README file names and branches
        const readmeVariants = ['README.md', 'readme.md', 'README', 'readme'];
        const branches = ['main', 'master'];
        
        let readmeContent = null;
        let readmeUrl = null;
        
        for (const branch of branches) {
          for (const readme of readmeVariants) {
            const tryUrl = `${baseRawUrl}/${branch}${pathPrefix}/${readme}`;
            console.log(`Trying to fetch README from: ${tryUrl}`);
            try {
              const { data } = await axios.get(tryUrl);
              readmeContent = data;
              readmeUrl = tryUrl;
              break;
            } catch (error) {
              if (error.response && error.response.status === 404) {
                continue; // Try next variant
              } else {
                console.error(`Error fetching ${tryUrl}:`, error.message);
              }
            }
          }
          if (readmeContent) break;
        }
        
        if (!readmeContent) {
          return response.status(404).json({ 
            error: 'No README file found in the specified GitHub repository/path' 
          });
        }
        
        console.log(`README fetched successfully from ${readmeUrl}, ${readmeContent.length} characters`);

        const lines = readmeContent.split('\n');
        console.log(`Split into ${lines.length} lines`);
        
        // Debug: show first 30 lines to understand format
        console.log('First 30 lines of README:');
        for (let i = 0; i < Math.min(30, lines.length); i++) {
          console.log(`${i + 1}: "${lines[i]}"`);
        }
        
        let inJsonBlock = false;
        let currentJson = '';
        const configs = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // More flexible JSON block detection
          const trimmedLine = line.trim().toLowerCase();
          if (trimmedLine.includes('```json') || trimmedLine.startsWith('```')) {
            console.log(`Potential JSON block start at line ${i + 1}: "${line}"`);
            
            // Check if this looks like a JSON block start
            if (trimmedLine.includes('json') || (trimmedLine.startsWith('```') && i + 1 < lines.length && lines[i + 1].trim().startsWith('{'))) {
              console.log(`Confirmed JSON block start at line ${i + 1}`);
              inJsonBlock = true;
              currentJson = '';
              continue;
            }
          }

          if (line.trim().startsWith('```') && inJsonBlock) {
            console.log(`Found JSON block end at line ${i + 1}, parsing content:`, currentJson.substring(0, 200) + '...');
            inJsonBlock = false;
            try {
              const parsed = JSON5.parse(currentJson);
              console.log('Successfully parsed JSON, checking structure...');
              
              if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
                console.log('Found mcpServers config:', Object.keys(parsed.mcpServers));
                configs.push(
                  ...Object.entries(parsed.mcpServers).map(([name, serverConfig]) => ({
                    name,
                    config: { mcpServers: { [name]: serverConfig } },
                  }))
                );
              } else if (parsed.mcp?.servers && typeof parsed.mcp.servers === 'object') {
                console.log('Found mcp.servers config:', Object.keys(parsed.mcp.servers));
                configs.push(
                  ...Object.entries(parsed.mcp.servers).map(([name, serverConfig]) => ({
                    name,
                    config: { mcpServers: { [name]: serverConfig } },
                  }))
                );
              } else {
                console.log('JSON structure not recognized:', Object.keys(parsed));
              }
            } catch (e) {
              console.log('Failed to parse JSON block:', e.message);
            }
            currentJson = '';
            continue;
          }

          if (inJsonBlock) {
            currentJson += line + '\n';
          }
        }

        console.log(`Found ${configs.length} total configurations`);

        if (configs.length === 0) {
          return response.status(404).json({
            success: false,
            error: "No valid MCP server configurations found in the README.",
          });
        }

        // If there's only one config option, add it directly.
        if (configs.length === 1) {
          const mcp = new MCPCompatibilityLayer();
          const success = await mcp.addServer(configs[0].config);
          if (!success) {
            return response.status(409).json({
              success: false,
              error: "Server with that name already exists.",
            });
          }
          return response
            .status(200)
            .json({ success: true, error: null, options: configs });
        }

        // Otherwise, return all found configurations for the user to select from.
        return response.status(200).json({
          success: true,
          error: null,
          options: configs,
        });
      } catch (error) {
        console.error("Error adding MCP server from GitHub:", error.message);
        return response.status(500).json({
          success: false,
          error: "Failed to fetch or parse README from GitHub.",
        });
      }
    }
  );

  app.post(
    "/mcp-servers/add-specific-config",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { config } = reqBody(request);
        if (!config) {
          return response
            .status(400)
            .json({ success: false, error: "No config provided." });
        }

        const mcp = new MCPCompatibilityLayer();
        const success = await mcp.addServer(config);

        if (!success) {
          return response.status(409).json({
            success: false,
            error: "Server with that name already exists.",
          });
        }

        return response.status(200).json({ success: true, error: null });
      } catch (e) {
        console.error("Error adding specific MCP server:", e.message);
        return response.status(500).json({ success: false, error: e.message });
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
    "/mcp-servers/update/:name",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (request, response) => {
      try {
        const { name } = request.params;
        const updates = reqBody(request);
        const mcp = new MCPCompatibilityLayer();
        const { success, error } = await mcp.updateServer(name, updates);
        return response.status(200).json({ success, error });
      } catch (error) {
        console.error("Error updating MCP server:", error);
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
