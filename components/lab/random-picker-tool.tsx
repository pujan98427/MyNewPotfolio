"use client";

import {useMemo,useState} from "react";
import styles from "./simple-tools.module.css";

const parse=(value:string)=>value.split(/[\n,]/).map(item=>item.trim()).filter(Boolean);
function secureIndex(length:number){const limit=Math.floor(0x100000000/length)*length;const values=new Uint32Array(1);do{crypto.getRandomValues(values)}while(values[0]>=limit);return values[0]%length}

export function RandomPickerTool(){
  const [input,setInput]=useState("");
  const [winner,setWinner]=useState("");
  const [removeAfter,setRemoveAfter]=useState(false);
  const [message,setMessage]=useState("");
  const choices=useMemo(()=>parse(input),[input]);
  const pick=()=>{if(choices.length<2){setMessage("Add at least two choices.");setWinner("");return}const selected=choices[secureIndex(choices.length)];setWinner(selected);setMessage("");if(removeAfter)setInput(choices.filter(choice=>choice!==selected).join("\n"))};
  return <div className={styles.workspace}><p className={styles.privacy}>Choices stay in this browser. Selection uses the browser’s cryptographic random source.</p><div className={styles.grid}><section className={styles.panel}><h2>Add your choices</h2><div className={styles.field}><label htmlFor="picker-options">One per line, or separated by commas</label><textarea id="picker-options" value={input} onChange={event=>{setInput(event.target.value);setWinner("")}} placeholder={"Alex\nMorgan\nSam"}/></div><details className={styles.advanced}><summary>More options</summary><label><input type="checkbox" checked={removeAfter} onChange={event=>setRemoveAfter(event.target.checked)}/> Remove the selected choice after each pick</label></details><div className={styles.actions}><button className={styles.button} onClick={pick}>Pick one</button><button className={styles.button} data-quiet onClick={()=>{setInput("");setWinner("");setMessage("")}}>Clear</button></div><p>{choices.length} {choices.length===1?"choice":"choices"}</p><p className={styles.status} data-error={Boolean(message)} role="status">{message}</p></section><section className={styles.panel}><h2>Selected</h2>{winner?<><p className={styles.winner} aria-live="polite">{winner}</p><button className={styles.button} data-quiet onClick={()=>navigator.clipboard.writeText(winner)}>Copy result</button></>:<p>The selected choice will appear here.</p>}</section></div></div>;
}
