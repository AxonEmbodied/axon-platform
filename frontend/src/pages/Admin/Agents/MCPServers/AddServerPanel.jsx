import React, { useState, useEffect } from "react";
import MCPServers from "@/models/mcpServers";
import { PlusCircle, GithubLogo } from "@phosphor-icons/react";
import { titleCase } from "text-case";
import truncate from "truncate";
import PreLoader from "@/components/Preloader";
import showToast from "@/utils/toast";

export default function AddServerPanel() {
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState([]);

  useEffect(() => {
    async function fetchDiscoveredServers() {
      const { servers: discoveredServers, error } =
        await MCPServers.discoverServers();
      if (error) {
        showToast("Could not discover MCP servers.", "error");
        setServers([]);
      } else {
        setServers(discoveredServers);
      }
      setLoading(false);
    }
    fetchDiscoveredServers();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <PreLoader />
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center gap-x-2">
          <p className="text-lg font-medium text-white">
            Discover & Add New MCP Servers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
        {servers.length === 0 && (
          <p className="text-sm text-white/60">
            No discoverable MCP servers found in `mcps_data.csv`.
          </p>
        )}
      </div>
    </div>
  );
}

function ServerCard({ server }) {
  const hasLogo = !!server.logo && server.logo.includes("http");
  return (
    <div className="bg-theme-bg-primary rounded-lg p-4 flex flex-col justify-between border border-white/10 hover:border-white/40 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            {hasLogo ? (
              <img
                src={server.logo}
                alt={`${server.name} logo`}
                className="w-10 h-10 rounded-md object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-theme-bg-secondary flex-shrink-0" />
            )}
            <p className="font-semibold text-white text-sm">
              {titleCase(server.name)}
            </p>
          </div>
          {server.link && (
            <a
              href={server.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white"
            >
              <GithubLogo size={24} />
            </a>
          )}
        </div>
        <p className="text-white/60 text-xs mt-3 leading-relaxed">
          {truncate(server.description, 140)}
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <button className="flex items-center gap-x-1 py-1 px-4 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all duration-300">
          <PlusCircle size={16} weight="bold" />
          Add
        </button>
      </div>
    </div>
  );
} 