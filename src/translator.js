// Execution engine for visual programming nodes

class ProgramTranslator {
  constructor() {
    this.code = []; // Generated Python code lines
    this.indentLevel = 0; // Track indentation for nested blocks
  }

  // Execute a single node based on its type and data
  executeNode(node, nodeData) {
    const { type } = node;

    switch (type) {
      case "start":
        console.log("Translating start node");
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
        console.log("Translating end node");
        break;
      default:
        console.warn(`Unknown node type: ${type}`);
    }
  }

  executeVariable(node, nodeData) {
    // nodeData should contain: { name: string, value: string }
    const { name, value } = nodeData;

    if (!name) {
      return;
    }

    // Generate Python code with proper formatting
    const indent = "  ".repeat(this.indentLevel);
    const parsedValue = isNaN(value) ? value : Number(value);
    if (typeof parsedValue === "string") {
      this.code.push(`${indent}${name} = "${parsedValue}"`);
    } else {
      this.code.push(`${indent}${name} = ${parsedValue}`);
    }
  }

  executeInput(node, nodeData) {
    // nodeData should contain: { variableName: string }
    const { variableName } = nodeData;

    if (!variableName) {
      return;
    }

    const indent = "  ".repeat(this.indentLevel);
    this.code.push(
      `${indent}${variableName} = input("Enter value for ${variableName}: ")`
    );
  }

  executePrint(node, nodeData) {
    // nodeData should contain: { inputType: 'string' | 'expression', value: string }
    const { inputType, value } = nodeData;

    if (value === undefined || value === null || value === "") {
      return;
    }

    const indent = "  ".repeat(this.indentLevel);

    if (inputType === "string") {
      // Print as literal string with quotes
      this.code.push(`${indent}print("${value}")`);
    } else if (inputType === "expression") {
      // Print expression without quotes
      this.code.push(`${indent}print(${value})`);
    }
  }

  executeIf(node, nodeData) {
    const { left, operator, right } = nodeData;

    if (!left || !operator || !right) {
      return;
    }

    const indent = "  ".repeat(this.indentLevel);

    // Format right side - add quotes if it's not a number and not already quoted
    let formattedRight = right;
    if (isNaN(right) && !right.startsWith('"') && !right.startsWith("'")) {
      formattedRight = `"${right}"`;
    }

    this.code.push(`${indent}if ${left} ${operator} ${formattedRight}:`);
    this.indentLevel++; // Increase indent for if body
  }

  executeLoop(node, nodeData) {
    const { type, count, condition } = nodeData;

    const indent = "  ".repeat(this.indentLevel);

    if (type === "count") {
      this.code.push(`${indent}for _ in range(${count}):`);
      this.indentLevel++; // Increase indent for loop body
    } else {
      this.code.push(`${indent}while ${condition}:`);
      this.indentLevel++; // Increase indent for loop body
    }
  }

  // Translate entire program given nodes in order
  translateProgram(orderedNodes, nodesData, connections) {
    this.code = [];
    this.indentLevel = 0;

    // Build a connection map for easier lookup
    this.connections = connections;
    this.nodes = orderedNodes;
    this.nodesData = nodesData;

    // Find the start node
    const startNode = orderedNodes.find((n) => n.type === "start");
    if (startNode) {
      this.translateFromNode(startNode.id);
    }

    return this.getCode();
  }

  // Translate starting from a specific node
  translateFromNode(nodeId, visited = new Set()) {
    if (visited.has(nodeId)) return; // Prevent infinite loops in graph
    visited.add(nodeId);

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const nodeData = this.nodesData[node.id] || {};

    // Generate code for the node
    this.executeNode(node, nodeData);

    // Find outgoing connections
    const outgoing = this.connections.filter((c) => c.from === nodeId);

    if (node.type === "if") {
      // Generate code for true branch
      const trueConn = outgoing.find((c) => c.branch === "true");
      if (trueConn) {
        this.translateFromNode(trueConn.to, new Set(visited));
      }
      this.indentLevel--; // Decrease indent after if block

      // Generate else branch if exists
      const falseConn = outgoing.find((c) => c.branch === "false");
      if (falseConn) {
        const indent = "  ".repeat(this.indentLevel);
        this.code.push(`${indent}else:`);
        this.indentLevel++;
        this.translateFromNode(falseConn.to, new Set(visited));
        this.indentLevel--;
      }
    } else if (node.type === "loop") {
      const bodyConn = outgoing.find((c) => c.branch === "body");
      const exitConn = outgoing.find((c) => c.branch === "exit");

      // Generate code for loop body
      if (bodyConn) {
        this.translateFromNode(bodyConn.to, new Set());
      }

      this.indentLevel--; // Decrease indent after loop

      // Continue with exit branch
      if (exitConn) {
        this.translateFromNode(exitConn.to, new Set(visited));
      }
    } else {
      // Regular node - follow all outgoing connections
      outgoing.forEach((conn) => {
        this.translateFromNode(conn.to, new Set(visited));
      });
    }
  }

  // Get generated Python code
  getCode() {
    return this.code.join("\n");
  }

  // Reset translator
  reset() {
    this.code = [];
    this.indentLevel = 0;
  }
}

export default ProgramTranslator;
