import { useState } from "react";
import Block from "./Block";
import "./Node.css";

export default function Node({
  id,
  x,
  y,
  type,
  onConnect,
  onPositionChange,
  onDataChange,
}) {
  const [inputType, setInputType] = useState("string");
  const [printValue, setPrintValue] = useState("");
  const [variableName, setVariableName] = useState("");
  const [variableValue, setVariableValue] = useState("");
  const [inputVariable, setInputVariable] = useState("");

  const handlePositionChange = (newX, newY, width, height) => {
    onPositionChange(id, newX, newY, width, height);
  };

  if (type === "start") {
    return (
      <Block
        initialX={x}
        initialY={y}
        color="#2ecc71"
        onPositionChange={handlePositionChange}
        start={true}
        type={type}
      ></Block>
    );
  } else if (type === "end") {
    return (
      <Block
        initialX={x}
        initialY={y}
        color="#e74c3c"
        onPositionChange={handlePositionChange}
        end={true}
        type={type}
      ></Block>
    );
  } else if (type === "print") {
    return (
      <Block
        initialX={x}
        initialY={y}
        color="#4a90e2"
        onPositionChange={handlePositionChange}
        type={type}
      >
        <div>
          <select
            value={inputType}
            onChange={(e) => {
              setInputType(e.target.value);
              onDataChange(id, {
                inputType: e.target.value,
                value: printValue,
              });
            }}
          >
            <option value="string">String</option>
            <option value="variable">Variable</option>
          </select>
          <br></br>
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
      </Block>
    );
  } else if (type === "input") {
    return (
      <Block
        initialX={x}
        initialY={y}
        color="#50e3c2"
        onPositionChange={handlePositionChange}
        type={type}
      >
        <input
          type="text"
          value={inputVariable}
          onChange={(e) => {
            setInputVariable(e.target.value);
            onDataChange(id, { variableName: e.target.value });
          }}
          placeholder="Enter variable name to store input"
        />
      </Block>
    );
  } else if (type === "variable") {
    return (
      <Block
        initialX={x}
        initialY={y}
        color="#f5a623"
        onPositionChange={handlePositionChange}
        type={type}
      >
        <input
          type="text"
          value={variableName}
          onChange={(e) => {
            setVariableName(e.target.value);
            onDataChange(id, { name: e.target.value, value: variableValue });
          }}
          placeholder="Variable Name"
        />
        =
        <input
          type="text"
          value={variableValue}
          onChange={(e) => {
            setVariableValue(e.target.value);
            onDataChange(id, { name: variableName, value: e.target.value });
          }}
          placeholder="Initial Value"
        />
      </Block>
    );
  } else {
    return (
      <Block
        initialX={x}
        initialY={y}
        color="#999"
        onPositionChange={handlePositionChange}
        type={type}
      ></Block>
    );
  }
}
