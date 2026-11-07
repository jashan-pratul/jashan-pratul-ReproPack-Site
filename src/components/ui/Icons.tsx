import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconGithub = ({ size = 16, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const IconChrome = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.25" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 8.5h8.5M8.97 13.75 4.72 6.4M15.03 13.75l-4.25 7.37" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Svg>
);

export const IconCopy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
    <path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const IconX = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5v12M7 11l5 5 5-5M4.5 20.5h15" />
  </Svg>
);

export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="M9 12h6" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </Svg>
);

export const IconEyeOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 3l18 18M10.6 5.6A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.5M6.2 6.9A16.4 16.4 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.3-1.1" />
    <path d="M9.9 10a2.75 2.75 0 0 0 4 3.8" />
  </Svg>
);

export const IconPlay = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.5 5v14l11-7-11-7Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconPause = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 5.5v13M16 5.5v13" strokeWidth={2.5} />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconZap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2.5 4.5 13.5h6.5l-1 8 8.5-11h-6.5l1-8Z" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Svg>
);

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 2.5 20h19L12 3.5Z" />
    <path d="M12 10v4.5M12 17.25v.01" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.75v.01" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconChevron = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const IconCommand = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6.5A2.5 2.5 0 1 0 6.5 9H9V6.5Zm0 0v11m0-11h6m-6 11A2.5 2.5 0 1 1 6.5 15H9v2.5Zm0 0h6m0-11A2.5 2.5 0 1 1 17.5 9H15V6.5Zm0 0v11m0 0A2.5 2.5 0 1 0 17.5 15H15v2.5Z" />
  </Svg>
);

export const IconKeyboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9" />
  </Svg>
);

export const IconDatabase = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="2.75" />
    <path d="M4.5 5.5v13c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75v-13M4.5 12c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75" />
  </Svg>
);

export const IconRadio = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5" />
  </Svg>
);

export const IconFileJson = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3.5H6.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9L14 3.5Z" />
    <path d="M14 3.5V9h5.5M10 12.5c-1 0-1 .75-1 1.5s-.5 1-1 1c.5 0 1 .25 1 1s0 1.5 1 1.5M14 12.5c1 0 1 .75 1 1.5s.5 1 1 1c-.5 0-1 .25-1 1s0 1.5-1 1.5" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const IconLayers = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Svg>
);

export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 5h17l-6.5 8v6l-4 1.5V13L3.5 5Z" />
  </Svg>
);

export const IconTerminal = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="m7.5 10 2.5 2.5-2.5 2.5M12.5 15h4" />
  </Svg>
);

export const IconList = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 6.5h12M8 12h12M8 17.5h12M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />
  </Svg>
);

export const IconCommit = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.25" />
    <path d="M2.5 12h6.25M15.25 12h6.25" />
  </Svg>
);

export const IconTree = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 4.5v13a2 2 0 0 0 2 2h10M6 10.5h12M10 4.5h8" />
  </Svg>
);

export const IconCode = (p: IconProps) => (
  <Svg {...p}>
    <path d="m8.5 7.5-4.5 4.5 4.5 4.5M15.5 7.5l4.5 4.5-4.5 4.5" />
  </Svg>
);

export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </Svg>
);

