import React, { useState, useEffect, useCallback } from "react";
import MCPServers from "@/models/mcpServers";
import { PlusCircle, GithubLogo, MagnifyingGlass } from "@phosphor-icons/react";
import { titleCase } from "text-case";
import truncate from "truncate";
import PreLoader from "@/components/Preloader";
import showToast from "@/utils/toast";

// Debounce hook for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function Highlight({ text, highlight }) {
  if (!highlight.trim()) {
    return <span>{truncate(text, 140)}</span>;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {" "}
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-400 text-black rounded-sm">
            {part}
          </mark>
        ) : (
          part
        )
      )}{" "}
    </span>
  );
}

export default function AddServerPanel() {
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInDescription, setSearchInDescription] = useState(false);
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchServers = useCallback(async (search = "", includeDescription = false) => {
    setLoading(true);
    try {
      const { servers: discoveredServers, error } = await MCPServers.discoverServers(
        search,
        includeDescription
      );
      if (error) {
        showToast("Could not discover MCP servers.", "error");
        setServers([]);
      } else {
        setServers(discoveredServers);
      }
    } catch (err) {
      showToast("Error fetching MCP servers.", "error");
      setServers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch servers when component mounts or search parameters change
  useEffect(() => {
    fetchServers(debouncedSearchQuery, searchInDescription);
  }, [debouncedSearchQuery, searchInDescription, fetchServers]);

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
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium text-white">
            Discover & Add New MCP Servers
          </p>
        </div>

        <div className="flex items-center gap-x-4">
          <div className="relative w-2/3">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
              size={18}
            />
            <input
              type="text"
              placeholder="Search servers by name..."
              className="bg-theme-bg-primary text-sm text-white w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-white/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-x-2">
            <input
              type="checkbox"
              id="search-description"
              className="h-4 w-4 rounded bg-theme-bg-primary border-white/10 text-sky-400 focus:ring-sky-400"
              checked={searchInDescription}
              onChange={(e) => setSearchInDescription(e.target.checked)}
            />
            <label
              htmlFor="search-description"
              className="text-sm text-white/80"
            >
              Search in description
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              searchQuery={debouncedSearchQuery}
              searchInDescription={searchInDescription}
            />
          ))}
        </div>
        {servers.length === 0 && (
          <p className="text-sm text-white/60">
            {debouncedSearchQuery
              ? "No servers match your search."
              : "No discoverable MCP servers found in `mcps_data.csv`."}
          </p>
        )}
      </div>
    </div>
  );
}

function ServerCard({ server, searchQuery, searchInDescription }) {
  const hasLogo = !!server.logo && server.logo.includes("http");
  const showHighlight = searchInDescription && searchQuery.trim() !== "";
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
          {showHighlight ? (
            <Highlight text={server.description} highlight={searchQuery} />
          ) : (
            truncate(server.description, 140)
          )}
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