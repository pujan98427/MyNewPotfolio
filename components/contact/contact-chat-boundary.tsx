"use client";

import { Component,type ReactNode } from "react";
import { ContactChat } from "@/components/contact/contact-chat";

type ContactChatBoundaryProps={turnstileSiteKey:string|null};
type ContactChatBoundaryState={failed:boolean};

export class ContactChatBoundary extends Component<ContactChatBoundaryProps,ContactChatBoundaryState>{
  state:ContactChatBoundaryState={failed:false};

  static getDerivedStateFromError():ContactChatBoundaryState{return {failed:true};}

  render():ReactNode{
    if(this.state.failed)return <aside className="contact-chat-fallback" aria-label="Contact Pujan"><a href="/contact">Contact Pujan</a></aside>;
    return <ContactChat turnstileSiteKey={this.props.turnstileSiteKey} />;
  }
}
