const ADSENSE_CLIENT_PATTERN=/^ca-pub-\d{16}$/;

export const adsenseEnabled=process.env.NEXT_PUBLIC_ADSENSE_ENABLED==="true";
export const adsenseClient=process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim()??"";
export const adsenseConfigured=adsenseEnabled&&ADSENSE_CLIENT_PATTERN.test(adsenseClient);

