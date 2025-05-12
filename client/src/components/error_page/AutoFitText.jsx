import React, { useEffect, useRef, useState } from "react";

export const AutoFitText = ({ text, maxFontSize = 100, minFontSize = 10, style = {} }) => {
  const containerRef = useRef();
  const textRef = useRef();
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current || !textRef.current) return;

      let currentSize = maxFontSize;
      textRef.current.style.fontSize = `${currentSize}px`;

      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;

      // Schrumpfen bis Text passt
      while (textRef.current.scrollWidth > containerWidth && currentSize > minFontSize) {
        currentSize -= 1;
        textRef.current.style.fontSize = `${currentSize}px`;
      }

      setFontSize(currentSize);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [text, maxFontSize, minFontSize]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        textAlign: "center",
        overflow: "hidden",
        whiteSpace: "nowrap",
        ...style
      }}
    >
      <span ref={textRef} style={{ fontSize: `${fontSize}px`, fontWeight: "bold" }}>
        {text}
      </span>
    </div>
  );
};
