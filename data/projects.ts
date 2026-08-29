type ProjectBase={
  slug:string;title:string;type:string;stack:readonly string[];image:string;imageWidth:number;imageHeight:number;imageAlt:string;
  summary:string;period:string;
};

export type EmployerProject=ProjectBase&{
  ownership:"employer";relationship:"Employment contribution";url:string;internalPath?:never;
};

export type PersonalProject=ProjectBase&{
  ownership:"personal";relationship:"Personal project";internalPath:`/work/${string}`;url?:string;
};

export type Project=EmployerProject|PersonalProject;

// Employer entries stay concise and external-only. Personal projects can opt into
// a deliberately created internal case study through the PersonalProject type.
export const projects:readonly Project[]=[
  {ownership:"employer",slug:"tripcart",title:"TripCart",type:"Product interface contribution",stack:["Frontend development","Responsive UI"],image:"/projects/tripcart.png",imageWidth:902,imageHeight:768,imageAlt:"TripCart interface shown as an employment contribution",summary:"Frontend implementation and responsive interface work completed as part of an employment team.",relationship:"Employment contribution",period:"2021 — 2025",url:"https://tripcart.com/"},
  {ownership:"employer",slug:"coachpodium",title:"CoachPodium",type:"Product interface contribution",stack:["Vue","Product UI"],image:"/projects/coachpodium.png",imageWidth:1180,imageHeight:713,imageAlt:"CoachPodium interface shown as an employment contribution",summary:"Vue interface and reusable UI work completed as part of an employment team.",relationship:"Employment contribution",period:"2021 — 2025",url:"https://coachpodium.com/"},
  {ownership:"employer",slug:"travelbee",title:"Travelbee",type:"WordPress theme contribution",stack:["WordPress","Frontend"],image:"/projects/travelbee-pro.png",imageWidth:1200,imageHeight:900,imageAlt:"Travelbee interface shown as an employment contribution",summary:"Responsive WordPress frontend work completed as part of an employment team.",relationship:"Employment contribution",period:"2021 — 2025",url:"https://wordpress.org/themes/travelbee/"},
  {ownership:"employer",slug:"rishi",title:"Rishi Starter Sites",type:"WordPress contribution",stack:["WordPress","Responsive UI"],image:"/projects/rishi-starter-sites.png",imageWidth:1200,imageHeight:900,imageAlt:"Rishi starter-site interface shown as an employment contribution",summary:"Reusable frontend patterns completed as part of an employment team.",relationship:"Employment contribution",period:"2021 — 2025",url:"https://rishitheme.com/starter-sites/"},
  {ownership:"employer",slug:"floral",title:"Blossom Floral Pro",type:"WordPress theme contribution",stack:["WordPress","Frontend"],image:"/projects/blossom-floral-pro.png",imageWidth:1200,imageHeight:900,imageAlt:"Blossom Floral Pro interface shown as an employment contribution",summary:"Responsive theme implementation completed as part of an employment team.",relationship:"Employment contribution",period:"2021 — 2025",url:"https://blossomthemes.com/wordpress-themes/blossom-floral-pro/"},
  {ownership:"employer",slug:"magazine",title:"Blossom Magazine Pro",type:"WordPress theme contribution",stack:["WordPress","Responsive UI"],image:"/projects/blossom-magazine-pro.png",imageWidth:1200,imageHeight:900,imageAlt:"Blossom Magazine Pro interface shown as an employment contribution",summary:"Editorial frontend implementation completed as part of an employment team.",relationship:"Employment contribution",period:"2021 — 2025",url:"https://blossomthemes.com/wordpress-themes/blossom-magazine-pro/"},
  {ownership:"employer",slug:"wellness",title:"Wellness Coach",type:"WordPress theme contribution",stack:["WordPress","Frontend"],image:"/projects/wellness-coach.png",imageWidth:1200,imageHeight:900,imageAlt:"Wellness Coach interface shown as an employment contribution",summary:"Responsive template work completed as part of an employment team.",relationship:"Employment contribution",period:"2021 — 2025",url:"https://blossomthemes.com/wordpress-themes/wellness-coach/"},
  {ownership:"employer",slug:"seva",title:"Seva",type:"WordPress theme contribution",stack:["WordPress","Frontend"],image:"/projects/seva-personal-brand-theme.png",imageWidth:1200,imageHeight:900,imageAlt:"Seva interface shown as an employment contribution",summary:"Landing-page frontend work completed as part of an employment team.",relationship:"Employment contribution",period:"2021 — 2025",url:"https://blossomthemes.com/wordpress-themes/seva/"},
];
