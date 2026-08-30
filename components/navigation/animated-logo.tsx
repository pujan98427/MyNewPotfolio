import {
  PUJAN_LOGO_DISPLAY_VIEW_BOX,
  pujanLogoDrawOrder,
  pujanLogoPaths,
} from "@/components/navigation/logo-geometry";

export function AnimatedLogo() {
  return (
    <svg
      className="animated-logo"
      viewBox={PUJAN_LOGO_DISPLAY_VIEW_BOX}
      role="img"
      aria-label="Pujan"
    >
      <g>
        {pujanLogoDrawOrder.map((name, index) => (
          <path
            key={name}
            className={`logo-stroke logo-part-${index + 1}`}
            pathLength="1"
            d={pujanLogoPaths[name]}
          />
        ))}
      </g>
      <g>
        {pujanLogoDrawOrder.map((name, index) => (
          <path
            key={name}
            className={`logo-fill logo-part-${index + 1}`}
            d={pujanLogoPaths[name]}
          />
        ))}
      </g>
      <path
        className="logo-glint"
        pathLength="1"
        d="M231 310 L247 227 M257 280 L289 259"
      />
    </svg>
  );
}
