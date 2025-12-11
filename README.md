# EZ-Programming

A visual programming interface that allows users to create programs by dragging and connecting nodes on a canvas. Built with React, Vite, and Ant Design for an intuitive and powerful programming experience.

![EZ-Programming Interface](src/assets/image.png)

## Features

- **Visual Node-Based Programming**: Create programs by dragging nodes onto a canvas and connecting them with directional arrows
- **Multiple Node Types**:
  - **Start**: Program entry point
  - **Print**: Output text to the terminal
  - **Input**: Get user input
  - **Variable**: Store and manipulate data
  - **If**: Conditional branching (true/false paths)
  - **Loop**: Iterative execution (count and while loops)
  - **End**: Program termination
- **Interactive Canvas**: Zoom, pan, and navigate the programming workspace
- **Real-time Execution**: Run programs and view output in an integrated terminal
- **Save/Load Projects**: Persist your programs as JSON files
- **Dark Theme UI**: Modern, eye-friendly interface built with Ant Design
- **Context Menus**: Right-click nodes for quick actions like deletion

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/alibadawi25/EZ-Programming.git
   cd EZ-Programming
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating a Program

1. **Add Nodes**: Drag node types from the left sidebar onto the canvas
2. **Connect Nodes**: Click on output ports (bottom) of nodes and then input ports (top) to create connections
3. **Configure Nodes**: Click on nodes to edit their properties (text, conditions, etc.)
4. **Execute**: Click the "Run Code" button to execute your program

### Node Types Guide

#### Basic Nodes

- **Start**: Marks the beginning of your program. Connect this to your first executable node.
- **Print**: Outputs text or variable values to the terminal. Configure the message to display.
- **Input**: Prompts for user input and stores it in a variable. Specify the prompt message.
- **Variable**: Stores data that can be used throughout your program. Set initial values or update from inputs.
- **End**: Marks the end of your program execution.

#### Control Flow Nodes

- **If**: Creates conditional branches. Connect to "true" or "false" outputs based on conditions.
- **Loop**: Supports both count-based and condition-based loops with "body" and "exit" paths.

### Canvas Controls

- **Zoom**: Use the zoom buttons or mouse wheel to zoom in/out
- **Pan**: Right-click and drag to pan around the canvas
- **Reset Zoom**: Click the percentage button to reset to 100%

### Saving and Loading

- **Save**: Click "Save" to download your program as a `.ez` file
- **Load**: Click "Load" to import a previously saved program

## Examples

### Hello World Program

1. Add a Start node
2. Add a Print node and connect Start → Print
3. Configure Print node with message "Hello, World!"
4. Add an End node and connect Print → End
5. Click "Run Code" to see the output

### Simple Calculator

1. Add Start → Input (get first number) → Variable (store first number)
2. Add Input (get second number) → Variable (store second number)
3. Add Print nodes for calculations and results
4. Connect to End node

### Conditional Logic

1. Add Input → Variable (get user input)
2. Add If node connected to the variable
3. Create different paths for true/false conditions
4. Add Print nodes for each path

## Project Structure

```
src/
├── App.jsx          # Main application component
├── Components/
│   ├── Node.jsx     # Node component definitions
│   └── Block.jsx    # Common block functionality
├── executor.js      # Program execution engine
├── App.css          # Application styles
└── main.jsx         # Application entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Technologies Used

- **React**: UI framework for building the interface
- **Vite**: Fast build tool and development server
- **Ant Design**: UI component library
- **SVG**: For rendering connection arrows and canvas elements
- **JavaScript ES6+**: Modern JavaScript features

## Future Enhancements

- [ ] Function nodes for reusable code blocks
- [ ] Array and object data types
- [ ] Advanced loop constructs
- [ ] Error handling and debugging tools
- [ ] Export to traditional programming languages
- [ ] Collaborative editing features
- [ ] Plugin system for custom node types

## Authors

- **Ali Badawi - alibadawi25**
- **Youssef Tamer - waryoyo**
- **Hamed A. Elgizery - HamedElgizery**
- **Ahmed Hisham - jvgcgch**
- **Youssef Ahmed**

---

Made with ❤️ for visual programming enthusiasts
