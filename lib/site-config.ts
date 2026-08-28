const configuredSiteUrl=process.env.NEXT_PUBLIC_SITE_URL?.trim();

if(!configuredSiteUrl){
  throw new Error("NEXT_PUBLIC_SITE_URL must be set to the canonical production HTTPS origin.");
}

let parsedSiteUrl:URL;
try{
  parsedSiteUrl=new URL(configuredSiteUrl);
}catch{
  throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
}

if(parsedSiteUrl.protocol!=="https:"){
  throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS.");
}

if(parsedSiteUrl.username||parsedSiteUrl.password||parsedSiteUrl.search||parsedSiteUrl.hash||parsedSiteUrl.pathname!=="/"){
  throw new Error("NEXT_PUBLIC_SITE_URL must contain only the HTTPS origin, without credentials, a path, query or fragment.");
}

export const SITE_URL=parsedSiteUrl.origin;
export const SITE_HOSTNAME=parsedSiteUrl.hostname;
