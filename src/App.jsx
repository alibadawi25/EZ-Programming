import { useState, useRef, useEffect } from "react";

import Node from "./Components/Node";
import ProgramExecutor from "./executor";
import "./App.css";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { Button, Layout, theme, Dropdown, Input } from "antd";
const { Header, Sider, Content } = Layout;

// Node type colors matching Ant Design dark theme
const NODE_COLORS = {
  start: "#2ecc71",
  end: "#e74c3c",
  print: "#4a90e2",
  input: "#50e3c2",
  variable: "#f5a623",
  if: "#9b59b6",
  loop: "#e67e22",
};

const NODE_TYPES = ["start", "print", "input", "variable", "if", "loop", "end"];

function App() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connecting, setConnecting] = useState(null);
  const [nodeData, setNodeData] = useState({});
  const [canvasTransform, setCanvasTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [projectName, setProjectName] = useState("EZ-Programming");
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const executorRef = useRef(new ProgramExecutor());

  const addNode = (type) => {
    const newId = Math.max(0, ...nodes.map((n) => n.id), -1) + 1;
    const newNode = {
      id: newId,
      x: 50,
      y: 50,
      type,
      width: 200,
      height: 100,
    };
    setNodes([...nodes, newNode]);
  };

  const handleConnect = (nodeId, isOutput, branch = null) => {
    if (connecting === null && isOutput) {
      // Start connection from output
      setConnecting({ from: nodeId, branch });
    } else if (connecting !== null && !isOutput) {
      // Complete connection to input
      if (connecting.from !== nodeId) {
        setConnections([
          ...connections,
          { from: connecting.from, to: nodeId, branch: connecting.branch },
        ]);
      }
      setConnecting(null);
    }
  };

  const deleteConnection = (index) => {
    setConnections(connections.filter((_, i) => i !== index));
  };

  const updateNodeData = (id, data) => {
    setNodeData((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...data },
    }));
  };

  const deleteNode = (nodeId) => {
    // Remove the node
    setNodes(nodes.filter((n) => n.id !== nodeId));
    // Remove all connections related to this node
    setConnections(
      connections.filter((c) => c.from !== nodeId && c.to !== nodeId)
    );
    // Remove node data
    setNodeData((prev) => {
      const newData = { ...prev };
      delete newData[nodeId];
      return newData;
    });
    setSelectedNodeId(null);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleNodeRightClick = (nodeId, e) => {
    e.preventDefault();
    setSelectedNodeId(nodeId);
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
  };

  // Keyboard shortcut for delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" && selectedNodeId !== null) {
        deleteNode(selectedNodeId);
      }
    };

    const handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0 });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [selectedNodeId]);

  const runCode = () => {
    // Clear previous output
    setTerminalOutput([]);
    setTerminalMinimized(false);

    // Build execution order using topological sort
    const visited = new Set();
    const order = [];

    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Visit all nodes that this node depends on first
      const incomingConnections = connections.filter((c) => c.to === nodeId);
      incomingConnections.forEach((conn) => visit(conn.from));

      order.push(nodeId);
    };

    // Start from nodes with no incoming connections
    nodes.forEach((node) => visit(node.id));

    // Get ordered nodes
    const orderedNodes = order.map((nodeId) =>
      nodes.find((n) => n.id === nodeId)
    );

    // Create a custom console to capture output
    const originalLog = console.log;
    const output = [];

    console.log = (...args) => {
      output.push(args.map((arg) => String(arg)).join(" "));
      originalLog(...args);
    };

    // Execute using the executor
    executorRef.current.reset();
    executorRef.current.executeProgram(orderedNodes, nodeData, connections);

    // Restore original console.log
    console.log = originalLog;

    // Set the terminal output
    setTerminalOutput(output.length > 0 ? output : ["Program executed"]);
  };

  const handleSave = () => {
    const saveData = {
      nodes,
      connections,
      nodeData,
      projectName,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(saveData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${projectName}.ez`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const loadData = (file) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setNodes(data.nodes || []);
        setConnections(data.connections || []);
        setNodeData(data.nodeData || {});
        setProjectName(data.projectName || "EZ-Programming");
      } catch (err) {
        alert("Failed to load file: Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  const updateNodePosition = (id, x, y, width, height) => {
    setNodes(
      nodes.map((node) =>
        node.id === id ? { ...node, x, y, width, height } : node
      )
    );
  };

  const handleDragEnd = (e, type) => {
    if (!contentRef.current) return;

    const contentRect = contentRef.current.getBoundingClientRect();
    const x = e.clientX - contentRect.left - canvasTransform.x;
    const y = e.clientY - contentRect.top - canvasTransform.y;

    // Only add node if dropped within the content area
    if (x > 0 && y > 0 && x < contentRect.width && y < contentRect.height) {
      const newId = Math.max(0, ...nodes.map((n) => n.id), -1) + 1;
      const newNode = {
        id: newId,
        x: x / canvasTransform.scale,
        y: y / canvasTransform.scale,
        type,
        width: 200,
        height: 100,
      };
      setNodes([...nodes, newNode]);
    }
  };

  const handleCanvasWheel = (e) => {
    // Don't zoom with wheel anymore, use buttons instead
    // This handler can be removed or kept for future use
  };

  const handleZoomIn = () => {
    setCanvasTransform((prev) => ({
      ...prev,
      scale: Math.min(3, prev.scale + 0.1),
    }));
  };

  const handleZoomOut = () => {
    setCanvasTransform((prev) => ({
      ...prev,
      scale: Math.max(0.5, prev.scale - 0.1),
    }));
  };

  const handleResetZoom = () => {
    setCanvasTransform({ scale: 1, x: 0, y: 0 });
  };

  const handleCanvasPan = (e) => {
    if (e.button !== 2) return; // Right mouse button
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startTransformX = canvasTransform.x;
    const startTransformY = canvasTransform.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setCanvasTransform((prev) => ({
        ...prev,
        x: startTransformX + deltaX,
        y: startTransformY + deltaY,
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Layout className="w-screen h-screen" theme="dark">
      {/* <button className="run-button" onClick={runCode}>
        Run Code
      </button> */}
      <Sider
        trigger={null}
        collapsible
        collapsed={false}
        style={{ background: "#141414", padding: "16px", overflow: "auto" }}
      >
        <div
          style={{
            color: "white",
            padding: "0 0 16px 0",
            textAlign: "center",
            fontWeight: "bold",
            borderBottom: "1px solid #434343",
            marginBottom: "16px",
          }}
        >
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            bordered={false}
            style={{
              background: "transparent",
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "16px",
              border: "none",
              outline: "none",
              padding: 0,
            }}
            placeholder="Project Name"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {NODE_TYPES.map((type) => (
            <div
              key={type}
              draggable
              onDragEnd={(e) => handleDragEnd(e, type)}
              style={{
                padding: "12px",
                background: NODE_COLORS[type],
                borderRadius: "6px",
                color: "white",
                fontWeight: "600",
                cursor: "grab",
                textTransform: "capitalize",
                textAlign: "center",
                transition: "all 0.2s ease",
                border: "2px solid transparent",
              }}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {type}
            </div>
          ))}
        </div>
      </Sider>
      <Content
        ref={contentRef}
        theme="dark"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#0a0e27",
          padding: 0,
        }}
        onWheel={handleCanvasWheel}
        onMouseDown={handleCanvasPan}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 10,
            display: "flex",
            gap: "8px",
          }}
        >
          <Button type="primary" onClick={runCode}>
            Run Code
          </Button>
          <Button
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            title="Zoom In"
          />
          <Button
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            title="Zoom Out"
          />
          <Button onClick={handleResetZoom} title="Reset Zoom to 100%">
            {Math.round(canvasTransform.scale * 100)}%
          </Button>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
          <Button
            type="primary"
            onClick={() => {
              const fileInput = document.createElement("input");
              fileInput.type = "file";
              fileInput.accept = ".ez,.json";
              fileInput.onchange = (e) => {
                const file = e.target.files[0];
                loadData(file);
              };
              fileInput.click();
            }}
          >
            Load
          </Button>
        </div>
        {contextMenu.visible && selectedNodeId !== null && (
          <div
            style={{
              position: "fixed",
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              zIndex: 1000,
              background: "#1f1f1f",
              border: "1px solid #434343",
              borderRadius: "4px",
              boxShadow: "0 3px 6px -4px rgba(0, 0, 0, 0.48)",
              padding: "4px 0",
            }}
          >
            <div
              onClick={() => deleteNode(selectedNodeId)}
              style={{
                padding: "8px 16px",
                color: "#ff4d4f",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#262626")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <DeleteOutlined />
              Delete
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
            transformOrigin: "0 0",
            transition: "transform 0.1s ease-out",
          }}
        >
          <svg
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {connections.map((conn, idx) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              // Calculate positions based on branch type
              let x1 = fromNode.x + (fromNode.width || 200) / 2;
              const y1 = fromNode.y + (fromNode.height || 100);
              const x2 = toNode.x + (toNode.width || 200) / 2;
              const y2 = toNode.y;

              // Adjust x1 for branched connections
              if (conn.branch === "true" || conn.branch === "body") {
                x1 = fromNode.x + (fromNode.width || 200) * 0.25;
              } else if (conn.branch === "false" || conn.branch === "exit") {
                x1 = fromNode.x + (fromNode.width || 200) * 0.75;
              }

              // Color based on branch
              let strokeColor = "#666";
              if (conn.branch === "true") strokeColor = "#2ecc71";
              else if (conn.branch === "false") strokeColor = "#e74c3c";
              else if (conn.branch === "body") strokeColor = "#9b59b6";
              else if (conn.branch === "exit") strokeColor = "#f39c12";

              return (
                <g key={idx}>
                  {/* Invisible wider path for easier clicking */}
                  <path
                    d={`M ${x1} ${y1} C ${x1} ${y1 + 50}, ${x2} ${
                      y2 - 50
                    }, ${x2} ${y2}`}
                    stroke="transparent"
                    strokeWidth="20"
                    fill="none"
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                    onClick={() => deleteConnection(idx)}
                  />
                  {/* Visible path */}
                  <path
                    d={`M ${x1} ${y1} C ${x1} ${y1 + 50}, ${x2} ${
                      y2 - 50
                    }, ${x2} ${y2}`}
                    stroke={strokeColor}
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Branch label */}
                  {conn.branch && (
                    <text
                      x={x1 + 10}
                      y={y1 + 20}
                      fill={strokeColor}
                      fontSize="12"
                      fontWeight="bold"
                      style={{ pointerEvents: "none" }}
                    >
                      {conn.branch}
                    </text>
                  )}
                </g>
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#666" />
              </marker>
            </defs>
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              onContextMenu={(e) => handleNodeRightClick(node.id, e)}
              onClick={() => setSelectedNodeId(node.id)}
            >
              <Node
                id={node.id}
                x={node.x}
                y={node.y}
                type={node.type}
                onConnect={handleConnect}
                onPositionChange={updateNodePosition}
                onDataChange={updateNodeData}
              />
            </div>
          ))}
        </div>

        {/* Terminal Output Panel */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#0a0e27",
            borderTop: "1px solid #434343",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            maxHeight: terminalMinimized ? "40px" : "200px",
            transition: "max-height 0.3s ease",
            boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              background: "#141414",
              borderBottom: terminalMinimized ? "none" : "1px solid #434343",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={() => setTerminalMinimized(!terminalMinimized)}
          >
            <span
              style={{ color: "white", fontWeight: "600", fontSize: "12px" }}
            >
              OUTPUT
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setTerminalOutput([]);
                }}
                style={{ color: "#8c8c8c" }}
              />
              <span style={{ color: "#8c8c8c", fontSize: "12px" }}>
                {terminalMinimized ? "▶" : "▼"}
              </span>
            </div>
          </div>
          {!terminalMinimized && (
            <div
              style={{
                flex: 1,
                padding: "12px 16px",
                overflow: "auto",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#00ff00",
                backgroundColor: "#000a15",
              }}
            >
              {terminalOutput.length === 0 ? (
                <span style={{ color: "#666" }}>Ready to execute...</span>
              ) : (
                terminalOutput.map((line, idx) => (
                  <div key={idx} style={{ marginBottom: "4px" }}>
                    {line}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default App;
