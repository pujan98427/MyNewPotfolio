import Link from "next/link"; import { ArrowUpRight } from "lucide-react";
export function ArrowLink({ href, children }:{ href:string; children:React.ReactNode }){ return <Link className="text-link" href={href}>{children}<ArrowUpRight aria-hidden="true" /></Link>; }
