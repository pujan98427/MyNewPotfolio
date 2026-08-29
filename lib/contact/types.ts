export type ContactTopic="website"|"job"|"collaboration"|"other";

export type ContactRequest={
  email:string;
  message:string;
  topic?:ContactTopic|string;
  website?:string;
  turnstileToken?:string;
  requestId?:string;
  completionTimeMs?:number;
};

export type ContactErrorCode=
  |"REQUEST_REJECTED"
  |"UNSUPPORTED_MEDIA_TYPE"
  |"PAYLOAD_TOO_LARGE"
  |"INVALID_REQUEST"
  |"VALIDATION_ERROR"
  |"RATE_LIMITED"
  |"SECURITY_CHECK_FAILED"
  |"SECURITY_CHECK_UNAVAILABLE"
  |"DELIVERY_DISABLED"
  |"SEND_FAILED";

export type ContactResponse=
  |{ok:true}
  |{ok:false;code:ContactErrorCode;message:string};
