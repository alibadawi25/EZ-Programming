import { useState, useEffect, useRef } from "react";
import "./Node.css";

export default function Block({
  children,
  initialX = 100,
  initialY = 100,
  color = "#4a90e2",
  onPositionChange,
  start = false,
  end = false,
  type = "block",
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
      {!start && (
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
      {!end && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onConnect(id, true);
          }}
          className="endPoint"
          title="Output"
        />
      )}
    </div>
  );
}
