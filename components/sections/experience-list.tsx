import { experience } from "@/data/experience";
export function ExperienceList() { return <div className="timeline">{experience.map((item,i)=><article key={item.company}><span>{String(i+1).padStart(2,"0")}</span><time>{item.period}</time><div><h3>{item.company}</h3><p>{item.place}</p></div><div><strong>{item.role}</strong><p>{item.detail}</p></div></article>)}</div>; }
