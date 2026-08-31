"use client";

import { Mail } from "lucide-react";
import { CONTACT_OPEN_EVENT } from "@/lib/contact/open-event";

export function ContactPanelButton(){return <button className="button button-primary contact-panel-button" type="button" onClick={()=>window.dispatchEvent(new Event(CONTACT_OPEN_EVENT))}>Message Pujan <Mail aria-hidden="true" /></button>;}
