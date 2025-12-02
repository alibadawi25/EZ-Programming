import { useState, useRef } from "react";

import Node from "./Components/Node";
import ProgramExecutor from "./executor";
import "./App.css";

function App() {
  const [nodes, setNodes] = useState([
    { id: 0, x: 100, y: 100, type: "start", width: 200, height: 100 },
    { id: 1, x: 200, y: 200, type: "print", width: 200, height: 100 },
    { id: 2, x: 200, y: 400, type: "input", width: 200, height: 100 },
    { id: 3, x: 200, y: 600, type: "variable", width: 200, height: 100 },
    { id: 4, x: 500, y: 700, type: "end", width: 200, height: 100 },
  ]);

  const [connections, setConnections] = useState([]);
  const [connecting, setConnecting] = useState(null);
  const [nodeData, setNodeData] = useState({});
  const canvasRef = useRef(null);
  const executorRef = useRef(new ProgramExecutor());

  const handleConnect = (nodeId, isOutput) => {
    if (connecting === null && isOutput) {
      // Start connection from output
      setConnecting({ from: nodeId });
    } else if (connecting !== null && !isOutput) {
      // Complete connection to input
      if (connecting.from !== nodeId) {
        setConnections([...connections, { from: connecting.from, to: nodeId }]);
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

  const runCode = () => {
    console.log("=== Running Code ===");

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

    // Execute using the executor
    executorRef.current.reset();
    const result = executorRef.current.executeProgram(orderedNodes, nodeData);

    console.log("=== Execution Complete ===");
    console.log("Result:", result);
  };

  const updateNodePosition = (id, x, y, width, height) => {
    setNodes(
      nodes.map((node) =>
        node.id === id ? { ...node, x, y, width, height } : node
      )
    );
  };

  return (
    <div className="App">
      <button className="run-button" onClick={runCode}>
        Run Code
      </button>
      <div className="sidebar">
        <h2>Draggable Blocks</h2>
        <p>Click and drag the blocks around!</p>
        <p style={{ fontSize: "12px" }}>
          Click output port (bottom) then input port (top) to connect
        </p>

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

            // Calculate center positions
            const x1 = fromNode.x + (fromNode.width || 200) / 2;
            const y1 = fromNode.y + (fromNode.height || 100);
            const x2 = toNode.x + (toNode.width || 200) / 2;
            const y2 = toNode.y;

            return (
              <g key={idx}>
                {/* Invisible wider path for easier clicking */}
                <path
                  d={`M ${x1} ${y1} C ${x1} ${
                    y1 + 50
                  }, ${x2} ${y2}, ${x2} ${y2}`}
                  stroke="transparent"
                  strokeWidth="20"
                  fill="none"
                  style={{ pointerEvents: "auto", cursor: "pointer" }}
                  onClick={() => deleteConnection(idx)}
                />
                {/* Visible path */}
                <path
                  d={`M ${x1} ${y1} C ${x1} ${
                    y1 + 50
                  }, ${x2} ${y2}, ${x2} ${y2}`}
                  stroke="#666"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  style={{ pointerEvents: "none" }}
                />
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
          <Node
            key={node.id}
            id={node.id}
            x={node.x}
            y={node.y}
            type={node.type}
            onConnect={handleConnect}
            onPositionChange={updateNodePosition}
            onDataChange={updateNodeData}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
