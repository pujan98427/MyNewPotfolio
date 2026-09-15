import "server-only";

export type ContactFailureCategory="configuration"|"provider"|"unexpected";
export type ProviderStatusCategory="not-applicable"|"client-error"|"server-error"|"unknown";
export type ContactRequestFailureCategory="configuration"|"turnstile"|"origin"|"validation";
export type ContactConfigurationReason="missing_RESEND_API_KEY"|"invalid_RESEND_API_KEY"|"missing_CONTACT_FROM_EMAIL"|"invalid_CONTACT_FROM_EMAIL"|"missing_CONTACT_TO_EMAIL"|"invalid_CONTACT_TO_EMAIL"|"invalid_CONTACT_FROM_NAME"|"missing_CONTACT_DELIVERY_MODE"|"invalid_CONTACT_DELIVERY_MODE";
type ContactFailureReason=ContactConfigurationReason|"network";

type ContactDeliveryFailureOptions={reason?:ContactFailureReason;providerStatusCode?:number;providerErrorName?:string};

export class ContactDeliveryFailure extends Error{
  readonly reason:ContactFailureReason|undefined;
  readonly providerStatusCode:number|undefined;
  readonly providerErrorName:string|undefined;
  constructor(readonly category:ContactFailureCategory,readonly providerStatusCategory:ProviderStatusCategory,options:ContactDeliveryFailureOptions={}){
    super("Contact delivery failed.");
    this.name="ContactDeliveryFailure";
    this.reason=options.reason;
    this.providerStatusCode=options.providerStatusCode;
    this.providerErrorName=options.providerErrorName;
  }
}

export function logContactFailure(requestId:string,error:unknown){
  const known=error instanceof ContactDeliveryFailure;
  const providerErrorName=known&&error.providerErrorName&&/^[A-Za-z0-9_.-]{1,100}$/.test(error.providerErrorName)?error.providerErrorName:undefined;
  console.error("contact_delivery_failed",{
    timestamp:new Date().toISOString(),
    requestId,
    errorCategory:known?error.category:"unexpected",
    ...(known&&error.reason?{reason:error.reason}:{reason:known?"provider":"network"}),
    providerStatusCategory:known?error.providerStatusCategory:"not-applicable",
    ...(known&&typeof error.providerStatusCode==="number"?{providerStatusCode:error.providerStatusCode}:{}),
    ...(providerErrorName?{providerErrorName}:{}),
  });
}

export function logContactRejection(errorCategory:ContactRequestFailureCategory,requestId?:string){
  console.error("contact_request_rejected",{
    timestamp:new Date().toISOString(),
    ...(requestId?{requestId}:{}),
    errorCategory,
  });
}
