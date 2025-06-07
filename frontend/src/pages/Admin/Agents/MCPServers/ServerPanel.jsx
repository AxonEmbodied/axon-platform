import React, { useState, useEffect, useRef } from "react";
import showToast from "@/utils/toast";
import { CaretDown, Gear, FloppyDisk } from "@phosphor-icons/react";
import MCPLogo from "@/media/agents/mcp-logo.svg";
import { titleCase } from "text-case";
import truncate from "truncate";
import MCPServers from "@/models/mcpServers";
import pluralize from "pluralize";

function ManageServerMenu({ server, toggleServer, onDelete }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(server.running);
  const menuRef = useRef(null);

  async function deleteServer() {
    if (
      !window.confirm(
        "Are you sure you want to delete this MCP server? It will be removed from your config file and you will need to add it back manually."
      )
    )
      return;
    const { success, error } = await MCPServers.deleteServer(server.name);
    if (success) {
      showToast("MCP server deleted successfully.", "success");
      onDelete(server.name);
    } else {
      showToast(error || "Failed to delete MCP server.", "error");
    }
  }

  async function handleToggleServer() {
    if (
      !window.confirm(
        running
          ? "Are you sure you want to stop this MCP server? It will be started automatically when you next start the server."
          : "Are you sure you want to start this MCP server? It will be started automatically when you next start the server."
      )
    )
      return;

    const { success, error } = await MCPServers.toggleServer(server.name);
    if (success) {
      const newState = !running;
      setRunning(newState);
      toggleServer(server.name);
      showToast(
        `MCP server ${server.name} ${newState ? "started" : "stopped"} successfully.`,
        "success",
        { clear: true }
      );
    } else {
      showToast(error || "Failed to toggle MCP server.", "error", {
        clear: true,
      });
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-white hover:bg-theme-action-menu-item-hover transition-colors duration-300"
      >
        <Gear className="h-5 w-5" weight="bold" />
      </button>
      {open && (
        <div className="absolute w-[150px] top-1 right-0 mt-1 border-[1.5px] border-white/40 rounded-lg bg-theme-action-menu-bg flex flex-col shadow-[0_4px_14px_rgba(0,0,0,0.25)] text-white z-99 md:z-10">
          <button
            type="button"
            onClick={handleToggleServer}
            className="border-none flex items-center rounded-lg gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
          >
            <span className="text-sm">
              {running ? "Stop MCP Server" : "Start MCP Server"}
            </span>
          </button>
          <button
            type="button"
            onClick={deleteServer}
            className="border-none flex items-center rounded-lg gap-x-2 hover:bg-theme-action-menu-item-hover py-1.5 px-2 transition-colors duration-200 w-full text-left"
          >
            <span className="text-sm">Delete MCP Server</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ServerPanel({ server, toggleServer, onDelete }) {
  const [env, setEnv] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEnv(server.config?.env || {});
    setHasChanges(false);
  }, [server]);

  const handleEnvChange = (key, value) => {
    setEnv(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const { success, error } = await MCPServers.updateServer(server.name, { env });
    if (success) {
      showToast("Server configuration updated successfully!", "success");
      setHasChanges(false);
    } else {
      showToast(error, "error");
    }
  };

  return (
    <>
      <div className="p-2">
        <div className="flex flex-col gap-y-[18px] max-w-[800px]">
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-x-2">
              <img src={MCPLogo} className="w-6 h-6 light:invert" />
              <label htmlFor="name" className="text-white text-md font-bold">
                {titleCase(server.name.replace(/[_-]/g, " "))}
              </label>
              {server.tools.length > 0 && (
                <p className="text-theme-text-secondary text-sm">
                  {server.tools.length} {pluralize("tool", server.tools.length)}{" "}
                  available
                </p>
              )}
            </div>
            <div className="flex items-center gap-x-2">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-1.5 px-4 rounded-md flex items-center gap-x-1"
                >
                  <FloppyDisk size={16} /> Save
                </button>
              )}
              <ManageServerMenu
                key={server.name}
                server={server}
                toggleServer={toggleServer}
                onDelete={onDelete}
              />
            </div>
          </div>
          <RenderServerConfig config={server.config} env={env} onEnvChange={handleEnvChange} />
          <RenderServerStatus server={server} />
          <RenderServerTools tools={server.tools} />
        </div>
      </div>
    </>
  );
}

function RenderServerConfig({ config = null, env = {}, onEnvChange }) {
  if (!config) return null;
  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <p className="text-theme-text-primary text-sm mb-1">Startup Command</p>
        <div className="bg-theme-bg-primary rounded-lg p-2.5">
          <p className="text-theme-text-secondary text-sm text-left">
            <span className="font-bold">Command:</span> {config.command}
          </p>
          <p className="text-theme-text-secondary text-sm text-left">
            <span className="font-bold">Arguments:</span>{" "}
            {config.args ? config.args.join(" ") : "None"}
          </p>
        </div>
      </div>
      <div>
        <p className="text-theme-text-primary text-sm mb-1">Environment Variables</p>
        <div className="bg-theme-bg-primary rounded-lg p-2.5 flex flex-col gap-y-2">
          {Object.keys(env).length > 0 ? (
            Object.entries(env).map(([key, value]) => (
              <div key={key} className="flex items-center gap-x-2">
                <label className="text-white/80 text-sm w-1/3">{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onEnvChange(key, e.target.value)}
                  className="bg-zinc-900 text-sm text-white w-2/3 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter value..."
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-white/60">No environment variables to configure for this server.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RenderServerStatus({ server }) {
  if (server.running || !server.error) return null;
  return (
    <div className="flex flex-col gap-y-2">
      <p className="text-theme-text-primary text-sm">
        This MCP server is not running - it may be stopped or experiencing an
        error on startup.
      </p>
      <div className="bg-theme-bg-primary rounded-lg p-4">
        <p className="text-red-500 text-sm font-mono">{server.error}</p>
      </div>
    </div>
  );
}

function RenderServerTools({ tools = [] }) {
  if (tools.length === 0) return null;
  return (
    <div className="flex flex-col gap-y-2">
      <p className="text-theme-text-primary text-sm">Available Tools</p>
      <div className="flex flex-col gap-y-2">
        {tools.map((tool) => (
          <ServerTool key={tool.name} tool={tool} />
        ))}
      </div>
    </div>
  );
}

function ServerTool({ tool }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="flex flex-col gap-y-2 px-4 py-2 rounded-lg bg-theme-bg-primary"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <p className="text-theme-text-primary font-mono font-bold text-sm">
            {tool.name}
          </p>
          {!open && (
            <p className="text-theme-text-secondary text-sm">
              {truncate(tool.description, 70)}
            </p>
          )}
        </div>
        <div className="border-none text-theme-text-secondary hover:text-cta-button">
          <CaretDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {open && (
        <div className="flex flex-col gap-y-2 pt-2 border-t border-white/10">
          <div className="flex flex-col gap-y-2">
            <p className="text-theme-text-secondary text-sm text-left">
              {tool.description}
            </p>
          </div>
          <div className="flex flex-col gap-y-2">
            <p className="text-theme-text-primary text-sm text-left font-bold">
              Tool call arguments
            </p>
            <div className="flex flex-col gap-y-2">
              {Object.entries(tool.inputSchema?.properties || {}).length > 0 ? (
                Object.entries(tool.inputSchema.properties).map(
                  ([key, value]) => (
                    <div key={key} className="flex items-center gap-x-2 ml-2">
                      <p className="text-theme-text-secondary text-sm text-left font-mono">
                        {key}
                        {tool.inputSchema?.required?.includes(key) && (
                          <span className="text-red-500 text-lg leading-none">*</span>
                        )}
                      </p>
                      <p className="text-theme-text-secondary/60 text-sm text-left">
                        ({value.type})
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-theme-text-secondary/60 text-sm text-left ml-2">No arguments required.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </button>
  );
} 