// Execution engine for visual programming nodes

class ProgramExecutor {
  constructor() {
    this.variables = {};
    this.output = [];
  }

  // Execute a single node based on its type and data
  executeNode(node, nodeData) {
    const { type } = node;

    switch (type) {
      case "start":
        this.executeStart(node, nodeData);
        break;
      case "variable":
        this.executeVariable(node, nodeData);
        break;
      case "input":
        this.executeInput(node, nodeData);
        break;
      case "print":
        this.executePrint(node, nodeData);
        break;
      case "end":
        this.executeEnd(node, nodeData);
        break;
      default:
        console.warn(`Unknown node type: ${type}`);
    }
  }

  executeStart(node, nodeData) {
    // console.log("Program started");
    // this.output.push("=== Program Start ===");
  }

  executeVariable(node, nodeData) {
    // nodeData should contain: { name: string, value: string }
    const { name, value } = nodeData;

    if (!name) {
      console.error("Variable name is required");
      return;
    }

    // Try to parse value as number, otherwise store as string
    const parsedValue = isNaN(value) ? value : Number(value);
    this.variables[name] = parsedValue;

    // console.log(`Variable set: ${name} = ${parsedValue}`);
    // this.output.push(`${name} = ${parsedValue}`);
  }

  executeInput(node, nodeData) {
    // nodeData should contain: { variableName: string }
    const { variableName } = nodeData;

    if (!variableName) {
      console.error("Variable name is required for input");
      return;
    }

    // In a real scenario, you'd get user input
    // For now, we'll simulate with a prompt or default value
    const userInput = prompt(`Enter value for ${variableName}:`);
    const parsedValue = isNaN(userInput) ? userInput : Number(userInput);

    this.variables[variableName] = parsedValue;
    // console.log(`Input received: ${variableName} = ${parsedValue}`);
    // this.output.push(`Input: ${variableName} = ${parsedValue}`);
  }

  executePrint(node, nodeData) {
    // nodeData should contain: { inputType: 'string' | 'variable', value: string }
    const { inputType, value } = nodeData;

    if (!value) {
      console.error("Print value is required");
      return;
    }

    let outputValue;

    if (inputType === "variable") {
      // Look up variable value
      if (this.variables.hasOwnProperty(value)) {
        outputValue = this.variables[value];
      } else {
        console.error(`Variable '${value}' not found`);
        outputValue = `[undefined: ${value}]`;
      }
    } else {
      // Print as string literal
      outputValue = value;
    }

    console.log(`${outputValue}`);
    this.output.push(`${outputValue}`);
  }

  executeEnd(node, nodeData) {
    // console.log("Program ended");
    // this.output.push("=== Program End ===");
  }

  // Execute entire program given nodes in order
  executeProgram(orderedNodes, nodesData) {
    this.variables = {};
    this.output = [];

    console.log("=== Starting Execution ===");

    orderedNodes.forEach((node) => {
      const nodeData = nodesData[node.id] || {};
      this.executeNode(node, nodeData);
    });

    console.log("=== Execution Complete ===");
    console.log("Final variables:", this.variables);
    console.log("Output:", this.output);

    return {
      variables: this.variables,
      output: this.output,
    };
  }

  // Get current state
  getState() {
    return {
      variables: { ...this.variables },
      output: [...this.output],
    };
  }

  // Reset executor
  reset() {
    this.variables = {};
    this.output = [];
  }
}

export default ProgramExecutor;
