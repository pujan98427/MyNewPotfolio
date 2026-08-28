const GOOGLE_ADSENSE_DOMAIN="google.com";
const GOOGLE_CERTIFICATION_AUTHORITY_ID="f08c47fec0942fa0";
const PUBLISHER_ID_PATTERN=/^pub-\d{16}$/;

/**
 * Returns no seller record until a genuine AdSense publisher ID is configured.
 * Keep the ID server-side; it is public only through the standard ads.txt file.
 */
export function createAdsTxt(publisherId=process.env.GOOGLE_ADSENSE_PUBLISHER_ID){
  const normalized=publisherId?.trim();
  if(!normalized||!PUBLISHER_ID_PATTERN.test(normalized))return null;
  return `${GOOGLE_ADSENSE_DOMAIN}, ${normalized}, DIRECT, ${GOOGLE_CERTIFICATION_AUTHORITY_ID}\n`;
}
