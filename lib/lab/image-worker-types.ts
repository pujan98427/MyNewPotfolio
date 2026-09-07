export type ImageOperation="compress"|"resize"|"convert"|"crop";

export type ProcessImageOptions={file:File;mode:ImageOperation;width:number;height:number;quality:number;outputType:string;ratio:string;position:number;cropX?:number;cropY?:number;cropWidth?:number;cropHeight?:number;cropZoom?:number;cropRotation?:number};
export type ProcessedImage={blob:Blob;width:number;height:number};
export type ImageFormatCandidate={type:string;blob:Blob;width:number;height:number};

export type ImageWorkerRequest=
  |{id:string;kind:"process";options:ProcessImageOptions}
  |{id:string;kind:"compare";file:File;quality:number;outputTypes:string[]};

export type ImageWorkerResponse=
  |{id:string;ok:true;kind:"process";result:ProcessedImage}
  |{id:string;ok:true;kind:"compare";result:ImageFormatCandidate[]}
  |{id:string;ok:false;message:string};
