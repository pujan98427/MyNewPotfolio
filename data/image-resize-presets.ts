export type ImageResizePreset={
  id:string;
  label:string;
  width:number;
  height:number;
};

// General-purpose canvas sizes. These are not social-network requirements.
export const imageResizePresets:ImageResizePreset[]=[
  {id:"square",label:"Square",width:1080,height:1080},
  {id:"landscape",label:"Landscape",width:1200,height:675},
  {id:"portrait",label:"Portrait",width:1080,height:1350},
  {id:"hd",label:"HD",width:1280,height:720},
  {id:"full-hd",label:"Full HD",width:1920,height:1080},
];
