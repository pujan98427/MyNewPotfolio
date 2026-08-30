"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type PrimaryNavigationLink={
  href:string;
  label:string;
};

export function PrimaryNavigation({links}:{links:readonly PrimaryNavigationLink[]}){
  const pathname=usePathname();

  return <nav aria-label="Primary navigation">
    {links.map(link=>{
      const active=pathname===link.href||pathname.startsWith(`${link.href}/`);
      return <Link key={link.href} href={link.href} aria-current={active?"page":undefined}>{link.label}</Link>;
    })}
  </nav>;
}
