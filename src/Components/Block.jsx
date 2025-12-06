import { useState, useEffect, useRef } from "react";
import "./Node.css";

export default function Block({
  id,
  initialX = 100,
  initialY = 100,
  color = "#4a90e2",
  onPositionChange,
  onConnect,
  onDataChange,
  hasInput = true,
  hasOutput = true,
  type = "block",
  children,
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const blockRef = useRef(null);

  const onDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging) return;
      const newPos = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      };
      setPos(newPos);
      if (onPositionChange && blockRef.current) {
        const rect = blockRef.current.getBoundingClientRect();
        onPositionChange(newPos.x, newPos.y, rect.width, rect.height);
      }
    };

    const stopDrag = () => setDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stopDrag);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stopDrag);
    };
  }, [dragging, offset, onPositionChange]);

  const renderOutputPorts = () => {
    if (type === "if") {
      return (
        <>
          {/* True branch */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onConnect(id, true, "true");
            }}
            style={{
              position: "absolute",
              bottom: -10,
              left: "25%",
              transform: "translateX(-50%)",
              width: 20,
              height: 20,
              background: "#2ecc71",
              borderRadius: "50%",
              cursor: "pointer",
              border: "2px solid white",
            }}
            title="True"
          />
          {/* False branch */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onConnect(id, true, "false");
            }}
            style={{
              position: "absolute",
              bottom: -10,
              left: "75%",
              transform: "translateX(-50%)",
              width: 20,
              height: 20,
              background: "#e74c3c",
              borderRadius: "50%",
              cursor: "pointer",
              border: "2px solid white",
            }}
            title="False"
          />
        </>
      );
    } else if (type === "loop") {
      return (
        <>
          {/* Loop body */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onConnect(id, true, "body");
            }}
            style={{
              position: "absolute",
              bottom: -10,
              left: "25%",
              transform: "translateX(-50%)",
              width: 20,
              height: 20,
              background: "#9b59b6",
              borderRadius: "50%",
              cursor: "pointer",
              border: "2px solid white",
            }}
            title="Loop Body"
          />
          {/* Exit loop */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onConnect(id, true, "exit");
            }}
            style={{
              position: "absolute",
              bottom: -10,
              left: "75%",
              transform: "translateX(-50%)",
              width: 20,
              height: 20,
              background: "#f39c12",
              borderRadius: "50%",
              cursor: "pointer",
              border: "2px solid white",
            }}
            title="Exit Loop"
          />
        </>
      );
    } else if (hasOutput) {
      // Regular single output
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onConnect(id, true);
          }}
          style={{
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 20,
            height: 20,
            background: "white",
            borderRadius: "50%",
            cursor: "pointer",
            border: "2px solid #333",
          }}
        />
      );
    }
    return null;
  };

  return (
    <div
      ref={blockRef}
      onPointerDown={onDown}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        padding: 20,
        background: color,
        borderRadius: 10,
        color: "white",
        cursor: "grab",
        userSelect: "none",
        fontWeight: 600,
        zIndex: 1,
      }}
    >
      {hasInput && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onConnect(id, false);
          }}
          className="startPoint"
          title="Input"
        />
      )}

      <div>{type.toUpperCase()}</div>

      {children}

      {renderOutputPorts()}
    </div>
  );
}
