import { useState } from "react";
import Block from "./Block";
import "./Node.css";

// Node content components - these define what's inside each node type
const NodeContent = {
  start: () => null,

  end: () => null,

  print: ({ id, onDataChange }) => {
    const [inputType, setInputType] = useState("string");
    const [printValue, setPrintValue] = useState("");

    return (
      <div>
        <select
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);
            onDataChange(id, { inputType: e.target.value, value: printValue });
          }}
        >
          <option value="string">String</option>
          <option value="variable">Variable</option>
        </select>
        <br />
        <input
          type="text"
          value={printValue}
          onChange={(e) => {
            setPrintValue(e.target.value);
            onDataChange(id, { inputType, value: e.target.value });
          }}
          placeholder={
            inputType === "string"
              ? "Enter text to print"
              : "Enter variable name"
          }
        />
      </div>
    );
  },

  input: ({ id, onDataChange }) => {
    const [inputVariable, setInputVariable] = useState("");

    return (
      <input
        type="text"
        value={inputVariable}
        onChange={(e) => {
          setInputVariable(e.target.value);
          onDataChange(id, { variableName: e.target.value });
        }}
        placeholder="Enter variable name to store input"
      />
    );
  },

  variable: ({ id, onDataChange }) => {
    const [variableName, setVariableName] = useState("");
    const [variableValue, setVariableValue] = useState("");

    return (
      <>
        <input
          type="text"
          value={variableName}
          onChange={(e) => {
            setVariableName(e.target.value);
            onDataChange(id, { name: e.target.value, value: variableValue });
          }}
          placeholder="Variable Name"
        />
        {" = "}
        <input
          type="text"
          value={variableValue}
          onChange={(e) => {
            setVariableValue(e.target.value);
            onDataChange(id, { name: variableName, value: e.target.value });
          }}
          placeholder="Initial Value"
        />
      </>
    );
  },
  loop: ({ id, onDataChange }) => {
    const [loopType, setLoopType] = useState("count");
    const [countValue, setCountValue] = useState("");
    const [whileCondition, setWhileCondition] = useState("");

    return (
      <div>
        <select
          value={loopType}
          onChange={(e) => {
            setLoopType(e.target.value);
            onDataChange(id, {
              type: e.target.value,
              count: countValue,
              condition: whileCondition,
            });
          }}
        >
          <option value="count">Repeat N times</option>
          <option value="while">While condition</option>
        </select>
        <br />
        {loopType === "count" ? (
          <input
            type="text"
            value={countValue}
            onChange={(e) => {
              setCountValue(e.target.value);
              onDataChange(id, { type: loopType, count: e.target.value });
            }}
            placeholder="Number of times"
          />
        ) : (
          <input
            type="text"
            value={whileCondition}
            onChange={(e) => {
              setWhileCondition(e.target.value);
              onDataChange(id, { type: loopType, condition: e.target.value });
            }}
            placeholder="Variable name"
          />
        )}
      </div>
    );
  },
  if: ({ id, onDataChange }) => {
    const [leftValue, setLeftValue] = useState("");
    const [operator, setOperator] = useState("==");
    const [rightValue, setRightValue] = useState("");

    return (
      <div>
        <input
          type="text"
          value={leftValue}
          onChange={(e) => {
            setLeftValue(e.target.value);
            onDataChange(id, {
              left: e.target.value,
              operator,
              right: rightValue,
            });
          }}
          placeholder="Variable or value"
          style={{ width: "60px" }}
        />
        <select
          value={operator}
          onChange={(e) => {
            setOperator(e.target.value);
            onDataChange(id, {
              left: leftValue,
              operator: e.target.value,
              right: rightValue,
            });
          }}
        >
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
        </select>
        <input
          type="text"
          value={rightValue}
          onChange={(e) => {
            setRightValue(e.target.value);
            onDataChange(id, {
              left: leftValue,
              operator,
              right: e.target.value,
            });
          }}
          placeholder="Variable or value"
          style={{ width: "60px" }}
        />
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
        <ContentComponent id={id} onDataChange={onDataChange} />
      )}
    </Block>
  );
}
