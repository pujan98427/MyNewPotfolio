import { SITE_URL } from "./site-config";
import { PERSON_NAME } from "./identity";

export const site = {
  name: PERSON_NAME,
  url: SITE_URL,
  email: "chapagain.pujan@gmail.com",
  location: "Glasgow, Scotland",
  socialLinks:[
    {label:"LinkedIn",href:"https://www.linkedin.com/in/pujanchapagain7/"},
    {label:"GitHub",href:"https://github.com/pujan98427"},
  ],
} as const;
