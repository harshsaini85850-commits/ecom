export default function PikachuCharacter() {
  return (
    <svg
      className="pikachu-art"
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g className="pika-tail">
        <rect x="3" y="14" width="3" height="3" fill="#b77919" />
        <rect x="5" y="11" width="3" height="3" fill="#e5a51d" />
        <rect x="8" y="9" width="3" height="3" fill="#e5a51d" />
        <rect x="6" y="7" width="3" height="3" fill="#e5a51d" />
        <rect x="9" y="5" width="3" height="3" fill="#e5a51d" />
        <rect x="12" y="5" width="3" height="3" fill="#8b5720" />
        <rect x="12" y="8" width="3" height="3" fill="#8b5720" />
      </g>

      <g className="pika-ears">
        <rect x="8" y="2" width="3" height="7" fill="#f7c52b" />
        <rect x="7" y="1" width="3" height="3" fill="#f7c52b" />
        <rect x="8" y="1" width="2" height="3" fill="#30251f" />
        <rect x="21" y="2" width="3" height="7" fill="#f7c52b" />
        <rect x="22" y="1" width="3" height="3" fill="#30251f" />
      </g>

      <g className="pika-body">
        <rect x="9" y="9" width="14" height="14" fill="#f7c52b" />
        <rect x="7" y="12" width="18" height="9" fill="#f7c52b" />
        <rect x="10" y="22" width="12" height="4" fill="#f7c52b" />
        <rect x="12" y="18" width="8" height="6" fill="#ffe58a" />

        <rect x="5" y="16" width="4" height="4" fill="#ed6651" />
        <rect x="23" y="16" width="4" height="4" fill="#ed6651" />

        <g className="pika-eyes">
          <rect x="11" y="13" width="2" height="3" fill="#29211d" />
          <rect x="20" y="13" width="2" height="3" fill="#29211d" />
          <rect x="11" y="13" width="1" height="1" fill="white" />
          <rect x="20" y="13" width="1" height="1" fill="white" />
        </g>

        <g className="pika-closed-eyes">
          <rect x="10" y="14" width="4" height="1" fill="#30251f" />
          <rect x="19" y="14" width="4" height="1" fill="#30251f" />
        </g>

        <rect x="15" y="16" width="2" height="1" fill="#30251f" />
        <rect x="14" y="18" width="1" height="1" fill="#75452b" />
        <rect x="17" y="18" width="1" height="1" fill="#75452b" />
      </g>

      <g className="pika-arm pika-arm-left">
        <rect x="6" y="20" width="3" height="4" fill="#f7c52b" />
        <rect x="5" y="22" width="3" height="2" fill="#f7c52b" />
      </g>

      <g className="pika-arm pika-arm-right">
        <rect x="23" y="20" width="3" height="4" fill="#f7c52b" />
        <rect x="24" y="22" width="3" height="2" fill="#f7c52b" />
      </g>

      <g className="pika-leg pika-leg-left">
        <rect x="10" y="24" width="4" height="4" fill="#d9951d" />
        <rect x="9" y="27" width="6" height="2" fill="#b77919" />
      </g>

      <g className="pika-leg pika-leg-right">
        <rect x="19" y="24" width="4" height="4" fill="#d9951d" />
        <rect x="18" y="27" width="6" height="2" fill="#b77919" />
      </g>
    </svg>
  );
}