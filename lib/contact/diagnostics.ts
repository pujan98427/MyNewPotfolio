import "server-only";

export type ContactFailureCategory="configuration"|"provider"|"unexpected";
export type ProviderStatusCategory="not-applicable"|"client-error"|"server-error"|"unknown";
export type ContactRequestFailureCategory="configuration"|"turnstile"|"origin"|"validation";

export class ContactDeliveryFailure extends Error{
  constructor(readonly category:ContactFailureCategory,readonly providerStatusCategory:ProviderStatusCategory){super("Contact delivery failed.");this.name="ContactDeliveryFailure";}
}

export function logContactFailure(requestId:string,error:unknown){
  const known=error instanceof ContactDeliveryFailure;
  console.error("contact_delivery_failed",{
    timestamp:new Date().toISOString(),
    requestId,
    errorCategory:known?error.category:"unexpected",
    providerStatusCategory:known?error.providerStatusCategory:"not-applicable",
  });
}

export function logContactRejection(errorCategory:ContactRequestFailureCategory,requestId?:string){
  console.error("contact_request_rejected",{
    timestamp:new Date().toISOString(),
    ...(requestId?{requestId}:{}),
    errorCategory,
  });
}
