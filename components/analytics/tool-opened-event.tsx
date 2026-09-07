"use client";

import {useEffect} from "react";
import {trackProductEvent} from "@/lib/analytics/product-events";

export function ToolOpenedEvent({toolName}:{toolName:string}){
  useEffect(()=>{trackProductEvent("tool_opened",{tool_name:toolName});},[toolName]);
  return null;
}
