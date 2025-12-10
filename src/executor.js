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
      case "if":
        return this.executeIf(node, nodeData);
      case "loop":
        return this.executeLoop(node, nodeData);
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
      return;
    }

    // Try to parse value as number, otherwise store as string
    const parsedValue = isNaN(value) ? value : Number(value);
    this.variables[name] = parsedValue;
  }

  executeInput(node, nodeData) {
    // nodeData should contain: { variableName: string }
    const { variableName } = nodeData;

    if (!variableName) {
      return;
    }

    // In a real scenario, you'd get user input
    // For now, we'll simulate with a prompt or default value
    const userInput = prompt(`Enter value for ${variableName}:`);
    const parsedValue = isNaN(userInput) ? userInput : Number(userInput);

    this.variables[variableName] = parsedValue;
  }


  // TODO: Make sure to fix case ahmed = "hard" and "ahmed" + "gamed"
  executePrint(node, nodeData) {
    // nodeData should contain: { inputType: 'string' | 'expression', value: string }
    const { inputType, value } = nodeData;

    if (value === undefined || value === null || value === "") {
      return;
    }

    let outputValue;

    if (inputType === "string") {
      // Print as literal string without any evaluation
      outputValue = value;
    } else if (inputType === "expression") {
      // Evaluate as an expression
      try {
        // Create a safe scope with available variables
        const scope = { ...this.variables };
        
        // Create a function that evaluates the expression in the given scope
        const evaluateExpression = (expr, variables) => {
          // Replace variable names with their values
          let evalExpr = expr;
          
          // Sort variables by length (longest first) to avoid partial replacements
          const sortedVars = Object.keys(variables).sort((a, b) => b.length - a.length);
          
          for (const varName of sortedVars) {
            // Only replace whole word matches
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            let replacement = variables[varName];
            
            // If the value is a string, wrap it in quotes for proper evaluation
            if (typeof replacement === 'string') {
              replacement = `"${replacement}"`;
            }
            
            evalExpr = evalExpr.replace(regex, replacement);
          }
          
          // Evaluate the expression
          return eval(evalExpr);
        };
        
        outputValue = evaluateExpression(value, scope);
      } catch (e) {
        // If evaluation fails, treat as literal string
        outputValue = value;
      }
    } else {
      outputValue = value;
    }

    console.log(`${outputValue}`);
    this.output.push(`${outputValue}`);
  }

  executeEnd(node, nodeData) {
    // console.log("Program ended");
    // this.output.push("=== Program End ===");
  }

  executeIf(node, nodeData) {
    const { left, operator, right } = nodeData;

    if (!left || !operator || !right) {
      return false;
    }

    const leftValue = this.resolveValue(left);
    const rightValue = this.resolveValue(right);
    const result = this.evaluateCondition(leftValue, operator, rightValue);

    return result;
  }

  executeLoop(node, nodeData) {
    const { type, count, condition } = nodeData;

    if (type === "count") {
      const iterations = parseInt(this.resolveValue(count)) || 0;
      return { type: "count", iterations };
    } else {
      return { type: "while", condition };
    }
  }

  resolveValue(value) {
    if (!value) return "";

    // Check if it's a variable name
    if (this.variables.hasOwnProperty(value)) {
      return this.variables[value];
    }

    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== "") {
      return num;
    }

    // Return as string
    return value;
  }

  evaluateCondition(left, operator, right) {
    switch (operator) {
      case "==":
        return left == right;
      case "!=":
        return left != right;
      case ">":
        return parseFloat(left) > parseFloat(right);
      case "<":
        return parseFloat(left) < parseFloat(right);
      case ">=":
        return parseFloat(left) >= parseFloat(right);
      case "<=":
        return parseFloat(left) <= parseFloat(right);
      default:
        return false;
    }
  }

  // Execute entire program given nodes in order
  executeProgram(orderedNodes, nodesData, connections) {
    this.variables = {};
    this.output = [];

    // Build a connection map for easier lookup
    this.connections = connections;
    this.nodes = orderedNodes;
    this.nodesData = nodesData;

    // Find the start node
    const startNode = orderedNodes.find((n) => n.type === "start");
    if (startNode) {
      this.executeFromNode(startNode.id);
    }

    return {
      variables: this.variables,
      output: this.output,
    };
  }

  // Execute starting from a specific node
  executeFromNode(nodeId, visited = new Set()) {
    if (visited.has(nodeId)) return; // Prevent infinite loops in graph
    visited.add(nodeId);

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const nodeData = this.nodesData[node.id] || {};

    // Execute the node
    const result = this.executeNode(node, nodeData);

    // Find outgoing connections
    const outgoing = this.connections.filter((c) => c.from === nodeId);

    if (node.type === "if") {
      // Follow true or false branch based on result
      const branch = result ? "true" : "false";
      const nextConn = outgoing.find((c) => c.branch === branch);
      if (nextConn) {
        this.executeFromNode(nextConn.to, new Set(visited));
      }
    } else if (node.type === "loop") {
      const bodyConn = outgoing.find((c) => c.branch === "body");
      const exitConn = outgoing.find((c) => c.branch === "exit");

      if (result.type === "count") {
        // Execute body N times
        for (let i = 0; i < result.iterations; i++) {
          var next = bodyConn.to;

          while (next != null) {
            this.executeFromNode(next, new Set());
            next = outgoing.find((c) => c.from === next)?.to;
          }
        }
        // After loop, follow exit
        if (exitConn) {
          this.executeFromNode(exitConn.to, new Set(visited));
        }
      } else if (result.type === "while") {
        // Execute while condition is true
        let iterations = 0;
        const maxIterations = 1000; // Safety limit
        while (this.variables[result.condition] && iterations < maxIterations) {
          if (bodyConn) {
            this.executeFromNode(bodyConn.to, new Set());
          }
          iterations++;
        }
        // After loop, follow exit
        if (exitConn) {
          this.executeFromNode(exitConn.to, new Set(visited));
        }
      }
    } else {
      // Regular node - follow all outgoing connections
      outgoing.forEach((conn) => {
        this.executeFromNode(conn.to, new Set(visited));
      });
    }
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
