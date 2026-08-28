import { SITE_URL } from "./site-config";
import { PERSON_NAME } from "./identity";

export const site = {
  name: PERSON_NAME,
  url: SITE_URL,
  email: "chapagain.pujan@gmail.com",
  location: "Glasgow, Scotland"
} as const;
