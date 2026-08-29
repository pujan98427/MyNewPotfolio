import "server-only";

export type ContactFailureCategory="configuration"|"provider"|"unexpected";
export type ProviderStatusCategory="not-applicable"|"client-error"|"server-error"|"unknown";

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
