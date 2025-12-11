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
      let newX = e.clientX - offset.x;
      let newY = e.clientY - offset.y;

      // Get the Content container (parent of the canvas)
      const contentContainer = blockRef.current?.closest(".ant-layout-content");

      if (contentContainer) {
        const containerRect = contentContainer.getBoundingClientRect();
        const blockRect = blockRef.current?.getBoundingClientRect();

        // Get relative position to container
        const relX = newX;
        const relY = newY;
        const blockWidth = blockRect?.width || 200;
        const blockHeight = blockRect?.height || 100;

        // Constrain to container bounds
        // Left boundary: 0
        newX = Math.max(0, newX);
        // Right boundary: container width - block width
        newX = Math.min(newX, containerRect.width - blockWidth);
        // Top boundary: 0
        newY = Math.max(0, newY);
        // Bottom boundary: container height - block height
        newY = Math.min(newY, containerRect.height - blockHeight);
      }

      const newPos = {
        x: newX,
        y: newY,
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
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(-50%) scale(1.2)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(-50%)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
            }}
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
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(-50%) scale(1.2)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(-50%)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
            }}
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
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(-50%) scale(1.2)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(-50%)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
            }}
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
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(-50%) scale(1.2)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(-50%)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
            }}
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
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(-50%) scale(1.2)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(-50%)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
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
        padding: "16px",
        background: color,
        borderRadius: "8px",
        color: "white",
        cursor: "grab",
        userSelect: "none",
        fontWeight: 600,
        zIndex: 1,
        pointerEvents: "auto",
        boxShadow:
          "0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 9px 28px 8px rgba(0, 0, 0, 0.20)",
        minWidth: "180px",
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

      <div
        style={{
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.5px",
          marginBottom: "12px",
        }}
      >
        {type.toUpperCase()}
      </div>

      {children && <div style={{ fontSize: "12px" }}>{children}</div>}

      {renderOutputPorts()}
    </div>
  );
}
