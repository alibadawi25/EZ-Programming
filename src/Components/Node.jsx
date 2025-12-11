import { useState } from "react";
import Block from "./Block";
import "./Node.css";
import { Input, Select } from "antd";

// Node content components - these define what's inside each node type
const NodeContent = {
  start: () => null,

  end: () => null,

  print: ({ id, nodeData, onDataChange }) => {
    const [inputType, setInputType] = useState(nodeData?.inputType || "string");
    const [printValue, setPrintValue] = useState(nodeData?.value || "");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Select
          value={inputType}
          onChange={(value) => {
            setInputType(value);
            onDataChange(id, { inputType: value, value: printValue });
          }}
          options={[
            { label: "String", value: "string" },
            { label: "Expression", value: "expression" },
          ]}
          size="small"
          style={{ width: "100%" }}
        />
        <Input
          value={printValue}
          onChange={(e) => {
            setPrintValue(e.target.value);
            onDataChange(id, { inputType, value: e.target.value });
          }}
          placeholder={
            inputType === "string"
              ? "Enter text to print (no evaluation)"
              : "e.g., x, x * 2, x + y"
          }
          size="small"
        />
        {inputType === "expression" && (
          <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)" }}>
            Supports: variables, math operations
          </div>
        )}
      </div>
    );
  },

  input: ({ id, nodeData, onDataChange }) => {
    const [inputVariable, setInputVariable] = useState(
      nodeData?.variableName || ""
    );

    return (
      <Input
        value={inputVariable}
        onChange={(e) => {
          setInputVariable(e.target.value);
          onDataChange(id, { variableName: e.target.value });
        }}
        placeholder="Enter variable name to store input"
        size="small"
      />
    );
  },

  variable: ({ id, nodeData, onDataChange }) => {
    const [variableName, setVariableName] = useState(nodeData?.name || "");
    const [variableValue, setVariableValue] = useState(nodeData?.value || "");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Input
          value={variableName}
          onChange={(e) => {
            setVariableName(e.target.value);
            onDataChange(id, { name: e.target.value, value: variableValue });
          }}
          placeholder="Variable Name"
          size="small"
        />
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "white", fontSize: "12px" }}>=</span>
          <Input
            value={variableValue}
            onChange={(e) => {
              setVariableValue(e.target.value);
              onDataChange(id, { name: variableName, value: e.target.value });
            }}
            placeholder="Number or Text"
            size="small"
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)" }}>
          Numbers or text (strings)
        </div>
      </div>
    );
  },
  loop: ({ id, nodeData, onDataChange }) => {
    const [loopType, setLoopType] = useState(nodeData?.type || "count");
    const [countValue, setCountValue] = useState(nodeData?.count || "");
    const [whileCondition, setWhileCondition] = useState(
      nodeData?.condition || ""
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Select
          value={loopType}
          onChange={(value) => {
            setLoopType(value);
            onDataChange(id, {
              type: value,
              count: countValue,
              condition: whileCondition,
            });
          }}
          options={[
            { label: "Repeat N times", value: "count" },
            { label: "While condition", value: "while" },
          ]}
          size="small"
          style={{ width: "100%" }}
        />
        {loopType === "count" ? (
          <Input
            type="number"
            value={countValue}
            onChange={(e) => {
              setCountValue(e.target.value);
              onDataChange(id, { type: loopType, count: e.target.value });
            }}
            placeholder="Number of times"
            size="small"
          />
        ) : (
          <Input
            value={whileCondition}
            onChange={(e) => {
              setWhileCondition(e.target.value);
              onDataChange(id, { type: loopType, condition: e.target.value });
            }}
            placeholder="Variable name"
            size="small"
          />
        )}
      </div>
    );
  },
  if: ({ id, nodeData, onDataChange }) => {
    const [leftValue, setLeftValue] = useState(nodeData?.left || "");
    const [operator, setOperator] = useState(nodeData?.operator || "==");
    const [rightValue, setRightValue] = useState(nodeData?.right || "");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <Input
            value={leftValue}
            onChange={(e) => {
              setLeftValue(e.target.value);
              onDataChange(id, {
                left: e.target.value,
                operator,
                right: rightValue,
              });
            }}
            placeholder="Var/Val"
            size="small"
            style={{ flex: 1, maxWidth: "60px" }}
          />
          <Select
            value={operator}
            onChange={(value) => {
              setOperator(value);
              onDataChange(id, {
                left: leftValue,
                operator: value,
                right: rightValue,
              });
            }}
            options={[
              { label: "==", value: "==" },
              { label: "!=", value: "!=" },
              { label: ">", value: ">" },
              { label: "<", value: "<" },
              { label: ">=", value: ">=" },
              { label: "<=", value: "<=" },
            ]}
            size="small"
            style={{ flex: 1, maxWidth: "55px" }}
          />
          <Input
            value={rightValue}
            onChange={(e) => {
              setRightValue(e.target.value);
              onDataChange(id, {
                left: leftValue,
                operator,
                right: e.target.value,
              });
            }}
            placeholder="Var/Val"
            size="small"
            style={{ flex: 1, maxWidth: "60px" }}
          />
        </div>
      </div>
    );
  },
};

// Node configuration - defines appearance and behavior of each node type
const nodeConfig = {
  start: {
    color: "#2ecc71",
    hasInput: false,
    hasOutput: true,
  },
  end: {
    color: "#e74c3c",
    hasInput: true,
    hasOutput: false,
  },
  print: {
    color: "#4a90e2",
    hasInput: true,
    hasOutput: true,
  },
  input: {
    color: "#50e3c2",
    hasInput: true,
    hasOutput: true,
  },
  variable: {
    color: "#f5a623",
    hasInput: true,
    hasOutput: true,
  },
  loop: {
    color: "#e67e22",
    hasInput: true,
    hasOutput: false, // Will have 2 custom outputs: body and exit
  },
  if: {
    color: "#9b59b6",
    hasInput: true,
    hasOutput: false, // Will have 2 custom outputs: true/false branches
  },
};

export default function Node({
  id,
  x,
  y,
  type,
  nodeData,
  onConnect,
  onPositionChange,
  onDataChange,
}) {
  const config = nodeConfig[type] || {
    color: "#999",
    hasInput: true,
    hasOutput: true,
  };

  const ContentComponent = NodeContent[type];

  const handlePositionChange = (newX, newY, width, height) => {
    onPositionChange(id, newX, newY, width, height);
  };

  return (
    <Block
      id={id}
      initialX={x}
      initialY={y}
      color={config.color}
      hasInput={config.hasInput}
      hasOutput={config.hasOutput}
      type={type}
      onPositionChange={handlePositionChange}
      onConnect={onConnect}
      onDataChange={onDataChange}
    >
      {ContentComponent && (
        <ContentComponent
          id={id}
          nodeData={nodeData}
          onDataChange={onDataChange}
        />
      )}
    </Block>
  );
}
