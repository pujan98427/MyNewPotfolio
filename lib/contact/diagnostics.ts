import "server-only";

export function logContactFailure(requestId:string,error:unknown){
  console.error("contact_delivery_failed",{requestId,errorType:error instanceof Error?error.name:"UnknownError"});
}
