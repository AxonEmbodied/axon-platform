import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import Admin from "@/models/admin";
import System from "@/models/system";
import showToast from "@/utils/toast";
import {
  CaretLeft,
  CaretRight,
  Plug,
  Robot,
  Hammer,
  FlowArrow,
} from "@phosphor-icons/react";
import ContextualSaveBar from "@/components/ContextualSaveBar";
import { castToType } from "@/utils/types";
import { FullScreenLoader } from "@/components/Preloader";
import { defaultSkills, configurableSkills } from "./skills";
import { DefaultBadge } from "./Badges/default";
import ImportedSkillList from "./Imported/SkillList";
import ImportedSkillConfig from "./Imported/ImportedSkillConfig";
import { Tooltip } from "react-tooltip";
import AgentFlowsList from "./AgentFlows";
import FlowPanel from "./AgentFlows/FlowPanel";
import { MCPServersList, MCPServerHeader } from "./MCPServers";
import ServerPanel from "./MCPServers/ServerPanel";
import AddServerPanel from "./MCPServers/AddServerPanel";
import { Link } from "react-router-dom";
import paths from "@/utils/paths";
import AgentFlows from "@/models/agentFlows";
import MCPServers from "@/models/mcpServers";

export default function AdminAgents() {
  const formEl = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState({});
  const [view, setView] = useState("skills"); // skills, flows, mcps, add_mcp
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [agentSkills, setAgentSkills] = useState([]);
  const [importedSkills, setImportedSkills] = useState([]);
  const [disabledAgentSkills, setDisabledAgentSkills] = useState([]);

  const [agentFlows, setAgentFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [activeFlowIds, setActiveFlowIds] = useState([]);

  // MCP Servers are lazy loaded to not block the UI thread
  const [mcpServers, setMcpServers] = useState([]);
  const [selectedMcpServer, setSelectedMcpServer] = useState(null);

  // Alert user if they try to leave the page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    async function fetchSettings() {
      const _settings = await System.keys();
      const _preferences = await Admin.systemPreferencesByFields([
        "disabled_agent_skills",
        "default_agent_skills",
        "imported_agent_skills",
        "active_agent_flows",
      ]);
      const { flows = [] } = await AgentFlows.listFlows();

      setSettings({ ..._settings, preferences: _preferences.settings } ?? {});
      setAgentSkills(_preferences.settings?.default_agent_skills ?? []);
      setDisabledAgentSkills(
        _preferences.settings?.disabled_agent_skills ?? []
      );
      setImportedSkills(_preferences.settings?.imported_agent_skills ?? []);
      setActiveFlowIds(_preferences.settings?.active_agent_flows ?? []);
      setAgentFlows(flows);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const toggleDefaultSkill = (skillName) => {
    setDisabledAgentSkills((prev) => {
      const updatedSkills = prev.includes(skillName)
        ? prev.filter((name) => name !== skillName)
        : [...prev, skillName];
      setHasChanges(true);
      return updatedSkills;
    });
  };

  const toggleAgentSkill = (skillName) => {
    setAgentSkills((prev) => {
      const updatedSkills = prev.includes(skillName)
        ? prev.filter((name) => name !== skillName)
        : [...prev, skillName];
      setHasChanges(true);
      return updatedSkills;
    });
  };

  const toggleFlow = (flowId) => {
    setActiveFlowIds((prev) => {
      const updatedFlows = prev.includes(flowId)
        ? prev.filter((id) => id !== flowId)
        : [...prev, flowId];
      return updatedFlows;
    });
  };

  const toggleMCP = (serverName) => {
    setMcpServers((prev) => {
      return prev.map((server) => {
        if (server.name !== serverName) return server;
        return { ...server, running: !server.running };
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      workspace: {},
      system: {},
      env: {},
    };

    const form = new FormData(formEl.current);
    for (var [key, value] of form.entries()) {
      if (key.startsWith("system::")) {
        const [_, label] = key.split("system::");
        data.system[label] = String(value);
        continue;
      }

      if (key.startsWith("env::")) {
        const [_, label] = key.split("env::");
        data.env[label] = String(value);
        continue;
      }
      data.workspace[key] = castToType(key, value);
    }

    const { success } = await Admin.updateSystemPreferences(data.system);
    await System.updateSystem(data.env);

    if (success) {
      const _settings = await System.keys();
      const _preferences = await Admin.systemPreferencesByFields([
        "disabled_agent_skills",
        "default_agent_skills",
        "imported_agent_skills",
      ]);
      setSettings({ ..._settings, preferences: _preferences.settings } ?? {});
      setAgentSkills(_preferences.settings?.default_agent_skills ?? []);
      setDisabledAgentSkills(
        _preferences.settings?.disabled_agent_skills ?? []
      );
      setImportedSkills(_preferences.settings?.imported_agent_skills ?? []);
      showToast(`Agent preferences saved successfully.`, "success", {
        clear: true,
      });
    } else {
      showToast(`Agent preferences failed to save.`, "error", { clear: true });
    }

    setHasChanges(false);
  };

  let SelectedSkillComponent = null;
  if (view === "add_mcp") {
    SelectedSkillComponent = AddServerPanel;
  } else if (selectedFlow) {
    SelectedSkillComponent = FlowPanel;
  } else if (selectedMcpServer) {
    SelectedSkillComponent = ServerPanel;
  } else if (selectedSkill?.imported) {
    SelectedSkillComponent = ImportedSkillConfig;
  } else if (configurableSkills[selectedSkill]) {
    SelectedSkillComponent = configurableSkills[selectedSkill]?.component;
  } else {
    SelectedSkillComponent = defaultSkills[selectedSkill]?.component;
  }

  // Update the click handlers to clear the other selection
  const handleDefaultSkillClick = (skill) => {
    setView("skills");
    setSelectedFlow(null);
    setSelectedMcpServer(null);
    setSelectedSkill(skill);
    if (isMobile) setShowSkillModal(true);
  };

  const handleSkillClick = (skill) => {
    setView("skills");
    setSelectedFlow(null);
    setSelectedMcpServer(null);
    setSelectedSkill(skill);
    if (isMobile) setShowSkillModal(true);
  };

  const handleFlowClick = (flow) => {
    setView("flows");
    setSelectedSkill(null);
    setSelectedMcpServer(null);
    setSelectedFlow(flow);
    if (isMobile) setShowSkillModal(true);
  };

  const handleMCPClick = (server) => {
    setView("mcps");
    setSelectedSkill(null);
    setSelectedFlow(null);
    setSelectedMcpServer(server);
    if (isMobile) setShowSkillModal(true);
  };

  const handleAddMCPClick = () => {
    setView("add_mcp");
    setSelectedSkill(null);
    setSelectedFlow(null);
    setSelectedMcpServer(null);
    if (isMobile) setShowSkillModal(true);
  };

  const handleServerAdded = async () => {
    const { servers = [] } = await MCPServers.listServers();
    setMcpServers(servers);
    setView('mcps');
  };

  const handleFlowDelete = (flowId) => {
    setSelectedFlow(null);
    setActiveFlowIds((prev) => prev.filter((id) => id !== flowId));
    setAgentFlows((prev) => prev.filter((flow) => flow.uuid !== flowId));
  };

  const handleMCPServerDelete = async (serverName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the MCP server "${serverName}"? This will stop the server if it is running and remove it from your configuration. This action cannot be undone.`
      )
    )
      return;

    setSelectedMcpServer(null);
    setMcpServers((prev) =>
      prev.filter((server) => server.name !== serverName)
    );
    const { success, error } = await MCPServers.deleteServer(serverName);
    if (!success) {
      showToast(error, "error");
      // If deletion fails, revert the state
      const { servers = [] } = await MCPServers.listServers();
      setMcpServers(servers);
    } else {
      showToast("MCP server deleted successfully.", "success");
    }
  };

  if (loading) {
    return (
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] w-full h-full flex justify-center items-center"
      >
        <FullScreenLoader />
      </div>
    );
  }

  if (isMobile) {
    return (
      <SkillLayout
        hasChanges={hasChanges}
        handleCancel={() => setHasChanges(false)}
        handleSubmit={handleSubmit}
      >
        <form
          onSubmit={handleSubmit}
          onChange={() => !selectedFlow && setHasChanges(true)}
          ref={formEl}
          className="flex flex-col w-full p-4 mt-10"
        >
          <input
            name="system::default_agent_skills"
            type="hidden"
            value={agentSkills.join(",")}
          />
          <input
            name="system::disabled_agent_skills"
            type="hidden"
            value={disabledAgentSkills.join(",")}
          />

          {/* Skill settings nav */}
          <div
            hidden={showSkillModal}
            className="flex flex-col gap-y-[18px] overflow-y-scroll no-scroll"
          >
            <div className="text-theme-text-primary flex items-center gap-x-2">
              <Robot size={24} />
              <p className="text-lg font-medium">Agent Skills</p>
            </div>
            {/* Default skills */}
            <SkillList
              skills={defaultSkills}
              selectedSkill={selectedSkill}
              handleClick={handleDefaultSkillClick}
              activeSkills={Object.keys(defaultSkills).filter(
                (skill) => !disabledAgentSkills.includes(skill)
              )}
            />
            {/* Configurable skills */}
            <SkillList
              skills={configurableSkills}
              selectedSkill={selectedSkill}
              handleClick={handleDefaultSkillClick}
              activeSkills={agentSkills}
            />

            <div className="text-theme-text-primary flex items-center gap-x-2">
              <Plug size={24} />
              <p className="text-lg font-medium">Custom Skills</p>
            </div>
            <ImportedSkillList
              skills={importedSkills}
              selectedSkill={selectedSkill}
              handleClick={handleSkillClick}
            />

            <div className="text-theme-text-primary flex items-center gap-x-2 mt-6">
              <FlowArrow size={24} />
              <p className="text-lg font-medium">Agent Flows</p>
            </div>
            <AgentFlowsList
              flows={agentFlows}
              selectedFlow={selectedFlow}
              handleClick={handleFlowClick}
            />
            <input
              type="hidden"
              name="system::active_agent_flows"
              id="active_agent_flows"
              value={activeFlowIds.join(",")}
            />
            <MCPServerHeader
              setMcpServers={setMcpServers}
              setSelectedMcpServer={setSelectedMcpServer}
              onAddClick={handleAddMCPClick}
            >
              {({ loadingMcpServers }) => {
                return (
                  <>
                    <MCPServersList
                      isLoading={loadingMcpServers}
                      servers={mcpServers}
                      selectedServer={selectedMcpServer}
                      handleClick={handleMCPClick}
                      onDelete={handleMCPServerDelete}
                    />
                    <div className="mt-4">
                      <AddServerButton onAddClick={handleAddMCPClick} />
                    </div>
                  </>
                );
              }}
            </MCPServerHeader>
          </div>

          {/* Selected agent skill modal */}
          {showSkillModal && (
            <div className="fixed top-0 left-0 w-full h-full bg-sidebar z-30">
              <div className="flex flex-col h-full">
                <div className="flex items-center p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSkillModal(false);
                      setSelectedSkill("");
                    }}
                    className="text-white/60 hover:text-white transition-colors duration-200"
                  >
                    <div className="flex items-center text-sky-400">
                      <CaretLeft size={24} />
                      <div>Back</div>
                    </div>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className=" bg-theme-bg-secondary text-white rounded-xl p-4 overflow-y-scroll no-scroll">
                    {SelectedSkillComponent ? (
                      <>
                        {selectedMcpServer ? (
                          <ServerPanel
                            server={selectedMcpServer}
                            toggleServer={toggleMCP}
                            onDelete={handleMCPServerDelete}
                          />
                        ) : selectedFlow ? (
                          <FlowPanel
                            flow={selectedFlow}
                            toggleFlow={toggleFlow}
                            enabled={activeFlowIds.includes(selectedFlow.uuid)}
                            onDelete={handleFlowDelete}
                          />
                        ) : view === "add_mcp" ? (
                          <AddServerPanel onServerAdded={handleServerAdded} />
                        ) : selectedSkill.imported ? (
                          <ImportedSkillConfig
                            key={selectedSkill.hubId}
                            selectedSkill={selectedSkill}
                            setImportedSkills={setImportedSkills}
                          />
                        ) : (
                          <>
                            {defaultSkills?.[selectedSkill] ? (
                              // The selected skill is a default skill - show the default skill panel
                              <SelectedSkillComponent
                                skill={defaultSkills[selectedSkill]?.skill}
                                settings={settings}
                                toggleSkill={toggleDefaultSkill}
                                enabled={
                                  !disabledAgentSkills.includes(
                                    defaultSkills[selectedSkill]?.skill
                                  )
                                }
                                setHasChanges={setHasChanges}
                                {...defaultSkills[selectedSkill]}
                              />
                            ) : (
                              // The selected skill is a configurable skill - show the configurable skill panel
                              <SelectedSkillComponent
                                skill={configurableSkills[selectedSkill]?.skill}
                                settings={settings}
                                toggleSkill={toggleAgentSkill}
                                enabled={agentSkills.includes(
                                  configurableSkills[selectedSkill]?.skill
                                )}
                                setHasChanges={setHasChanges}
                                {...configurableSkills[selectedSkill]}
                              />
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-theme-text-secondary">
                        <Robot size={40} />
                        <p className="font-medium">
                          Select an Agent Skill, Agent Flow, or MCP Server
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </SkillLayout>
    );
  }

  return (
    <SkillLayout
      hasChanges={hasChanges}
      handleCancel={() => setHasChanges(false)}
      handleSubmit={handleSubmit}
    >
      <form
        onSubmit={handleSubmit}
        onChange={() =>
          !selectedSkill?.imported && !selectedFlow && setHasChanges(true)
        }
        ref={formEl}
        className="flex-1 flex gap-x-6 p-4 mt-10"
      >
        <input
          name="system::default_agent_skills"
          type="hidden"
          value={agentSkills.join(",")}
        />
        <input
          name="system::disabled_agent_skills"
          type="hidden"
          value={disabledAgentSkills.join(",")}
        />
        <input
          type="hidden"
          name="system::active_agent_flows"
          id="active_agent_flows"
          value={activeFlowIds.join(",")}
        />

        {/* Skill settings nav - Make this section scrollable */}
        <div className="flex flex-col min-w-[360px] h-[calc(100vh-90px)]">
          <div className="flex-none mb-4">
            <div className="text-theme-text-primary flex items-center gap-x-2">
              <Robot size={24} />
              <p className="text-lg font-medium">Agent Skills</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            <div className="space-y-4">
              {/* Default skills list */}
              <SkillList
                skills={defaultSkills}
                selectedSkill={selectedSkill}
                handleClick={handleSkillClick}
                activeSkills={Object.keys(defaultSkills).filter(
                  (skill) => !disabledAgentSkills.includes(skill)
                )}
              />
              {/* Configurable skills */}
              <SkillList
                skills={configurableSkills}
                selectedSkill={selectedSkill}
                handleClick={handleSkillClick}
                activeSkills={agentSkills}
              />

              <div className="text-theme-text-primary flex items-center gap-x-2 mt-4">
                <Plug size={24} />
                <p className="text-lg font-medium">Custom Skills</p>
              </div>
              <ImportedSkillList
                skills={importedSkills}
                selectedSkill={selectedSkill}
                handleClick={handleSkillClick}
              />

              <div className="text-theme-text-primary flex items-center justify-between gap-x-2 mt-4">
                <div className="flex items-center gap-x-2">
                  <FlowArrow size={24} />
                  <p className="text-lg font-medium">Agent Flows</p>
                </div>
                {agentFlows.length === 0 ? (
                  <Link
                    to={paths.agents.builder()}
                    className="text-cta-button flex items-center gap-x-1 hover:underline"
                  >
                    <Hammer size={16} />
                    <p className="text-sm">Create Flow</p>
                  </Link>
                ) : (
                  <Link
                    to={paths.agents.builder()}
                    className="text-theme-text-secondary hover:text-cta-button flex items-center gap-x-1"
                  >
                    <Hammer size={16} />
                    <p className="text-sm">Open Builder</p>
                  </Link>
                )}
              </div>
              <AgentFlowsList
                flows={agentFlows}
                selectedFlow={selectedFlow}
                handleClick={handleFlowClick}
              />

              <MCPServerHeader
                setMcpServers={setMcpServers}
                setSelectedMcpServer={setSelectedMcpServer}
                onAddClick={handleAddMCPClick}
              >
                {({ loadingMcpServers }) => {
                  return (
                    <>
                      <MCPServersList
                        isLoading={loadingMcpServers}
                        servers={mcpServers}
                        selectedServer={selectedMcpServer}
                        handleClick={handleMCPClick}
                        onDelete={handleMCPServerDelete}
                      />
                      <div className="mt-4">
                        <AddServerButton onAddClick={handleAddMCPClick} />
                      </div>
                    </>
                  );
                }}
              </MCPServerHeader>
            </div>
          </div>
        </div>

        {/* Selected agent skill setting panel */}
        <div className="flex-[2] flex flex-col gap-y-[18px] mt-10">
          <div className="bg-theme-bg-secondary text-white rounded-xl flex-1 p-4 overflow-y-scroll no-scroll">
            {SelectedSkillComponent ? (
              <>
                {selectedMcpServer ? (
                  <ServerPanel
                    server={selectedMcpServer}
                    toggleServer={toggleMCP}
                    onDelete={handleMCPServerDelete}
                  />
                ) : selectedFlow ? (
                  <FlowPanel
                    flow={selectedFlow}
                    toggleFlow={toggleFlow}
                    enabled={activeFlowIds.includes(selectedFlow.uuid)}
                    onDelete={handleFlowDelete}
                  />
                ) : view === "add_mcp" ? (
                  <AddServerPanel onServerAdded={handleServerAdded} />
                ) : selectedSkill.imported ? (
                  <ImportedSkillConfig
                    key={selectedSkill.hubId}
                    selectedSkill={selectedSkill}
                    setImportedSkills={setImportedSkills}
                  />
                ) : (
                  <>
                    {defaultSkills?.[selectedSkill] ? (
                      // The selected skill is a default skill - show the default skill panel
                      <SelectedSkillComponent
                        skill={defaultSkills[selectedSkill]?.skill}
                        settings={settings}
                        toggleSkill={toggleDefaultSkill}
                        enabled={
                          !disabledAgentSkills.includes(
                            defaultSkills[selectedSkill]?.skill
                          )
                        }
                        setHasChanges={setHasChanges}
                        {...defaultSkills[selectedSkill]}
                      />
                    ) : (
                      // The selected skill is a configurable skill - show the configurable skill panel
                      <SelectedSkillComponent
                        skill={configurableSkills[selectedSkill]?.skill}
                        settings={settings}
                        toggleSkill={toggleAgentSkill}
                        enabled={agentSkills.includes(
                          configurableSkills[selectedSkill]?.skill
                        )}
                        setHasChanges={setHasChanges}
                        {...configurableSkills[selectedSkill]}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-theme-text-secondary">
                <Robot size={40} />
                <p className="font-medium">
                  Select an Agent Skill, Agent Flow, or MCP Server
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </SkillLayout>
  );
}

function SkillLayout({ children, hasChanges, handleSubmit, handleCancel }) {
  return (
    <div
      id="workspace-agent-settings-container"
      className="w-screen h-screen overflow-hidden bg-theme-bg-container flex md:mt-0 mt-6"
    >
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] w-full h-full flex"
      >
        {children}
        <ContextualSaveBar
          showing={hasChanges}
          onSave={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

function SkillList({
  isDefault = false,
  skills = [],
  selectedSkill = null,
  handleClick = null,
  activeSkills = [],
}) {
  if (skills.length === 0) return null;

  return (
    <>
      <div
        className={`bg-theme-bg-secondary text-white rounded-xl ${
          isMobile ? "w-full" : "min-w-[360px] w-fit"
        }`}
      >
        {Object.entries(skills).map(([skill, settings], index) => (
          <div
            key={skill}
            className={`py-3 px-4 flex items-center justify-between ${
              index === 0 ? "rounded-t-xl" : ""
            } ${
              index === Object.keys(skills).length - 1
                ? "rounded-b-xl"
                : "border-b border-white/10"
            } cursor-pointer transition-all duration-300  hover:bg-theme-bg-primary ${
              selectedSkill === skill
                ? "bg-white/10 light:bg-theme-bg-sidebar"
                : ""
            }`}
            onClick={() => handleClick?.(skill)}
          >
            <div className="text-sm font-light">{settings.title}</div>
            <div className="flex items-center gap-x-2">
              {isDefault ? (
                <DefaultBadge title={skill} />
              ) : (
                <div className="text-sm text-theme-text-secondary font-medium">
                  {activeSkills.includes(skill) ? "On" : "Off"}
                </div>
              )}
              <CaretRight
                size={14}
                weight="bold"
                className="text-theme-text-secondary"
              />
            </div>
          </div>
        ))}
      </div>
      {/* Tooltip for default skills - only render when skill list is passed isDefault */}
      {isDefault && (
        <Tooltip
          id="default-skill"
          place="bottom"
          delayShow={300}
          className="tooltip light:invert-0 !text-xs"
        />
      )}
    </>
  );
}

function AddServerButton({ onAddClick }) {
  return (
    <div
      onClick={onAddClick}
      className="py-3 px-4 flex items-center justify-center rounded-xl bg-theme-bg-secondary hover:bg-theme-bg-primary cursor-pointer border border-dashed border-white/10 animate-pulse-fast hover:animate-none"
    >
      <div className="flex items-center gap-x-2">
        <div className="text-sm font-light text-white/60">
          View and manage MCP servers
        </div>
      </div>
    </div>
  );
}
