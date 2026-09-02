"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import styles from "./simple-tools.module.css";
import {useMobileResultScroll} from "@/lib/lab/use-mobile-result-scroll";

type PickerMode="one"|"several"|"shuffle";
const UINT32_RANGE=0x100000000;
const REMEMBERED_LIST_KEY="pujan-lab-random-picker-list";
const parse=(value:string)=>value.split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
function unbiasedRandomIndex(length:number){if(!Number.isSafeInteger(length)||length<1||length>UINT32_RANGE)throw new RangeError("Random selection requires a non-empty supported list.");const limit=UINT32_RANGE-(UINT32_RANGE%length),values=new Uint32Array(1);do{crypto.getRandomValues(values)}while(values[0]>=limit);return values[0]%length}
function secureShuffle<T>(values:T[]){const shuffled=[...values];for(let index=shuffled.length-1;index>0;index--){const selected=unbiasedRandomIndex(index+1);[shuffled[index],shuffled[selected]]=[shuffled[selected],shuffled[index]]}return shuffled}

export function RandomPickerTool(){
  const resultRef=useRef<HTMLElement>(null);
  const [input,setInput]=useState(""),[mode,setMode]=useState<PickerMode>("one"),[pickCount,setPickCount]=useState(2),[results,setResults]=useState<string[]>([]),[removeAfter,setRemoveAfter]=useState(false),[rememberList,setRememberList]=useState(false),[storageReady,setStorageReady]=useState(false),[message,setMessage]=useState(""),[copied,setCopied]=useState(false);
  const choices=useMemo(()=>parse(input),[input]);
  useMobileResultScroll(results.length>0,resultRef);
  useEffect(()=>{let active=true;queueMicrotask(()=>{if(!active)return;try{const saved=localStorage.getItem(REMEMBERED_LIST_KEY);if(saved!==null){setInput(saved);setRememberList(true)}}catch{}finally{setStorageReady(true)}});return()=>{active=false}},[]);
  useEffect(()=>{if(!storageReady)return;try{if(rememberList)localStorage.setItem(REMEMBERED_LIST_KEY,input);else localStorage.removeItem(REMEMBERED_LIST_KEY)}catch{}},[input,rememberList,storageReady]);
  const choose=()=>{if(choices.length<2){setMessage("Add at least two choices.");setResults([]);return}const shuffled=secureShuffle(choices),count=mode==="one"?1:mode==="several"?Math.min(Math.max(2,pickCount),choices.length):choices.length,next=shuffled.slice(0,count);setResults(next);setMessage("");setCopied(false);if(removeAfter&&mode!=="shuffle"){const selected=new Set(next);setInput(choices.filter(choice=>!selected.has(choice)).join("\n"))}};
  const removeAndChoose=()=>{const selected=new Set(results),remaining=choices.filter(choice=>!selected.has(choice));setInput(remaining.join("\n"));setCopied(false);if(!remaining.length){setResults([]);setMessage("Every choice has been selected.");return}if(remaining.length===1){setResults(remaining);setMessage("This is the final remaining choice.");return}const shuffled=secureShuffle(remaining),count=mode==="several"?Math.min(Math.max(2,pickCount),remaining.length):1;setResults(shuffled.slice(0,count));setMessage("")};
  const clear=()=>{setInput("");setMode("one");setPickCount(2);setResults([]);setMessage("");setRemoveAfter(false);setRememberList(false);setCopied(false)};
  const copy=async()=>{await navigator.clipboard.writeText(results.join("\n"));setCopied(true);window.setTimeout(()=>setCopied(false),1600)};
  const actionLabel=mode==="one"?"Pick one":mode==="several"?"Pick several":"Shuffle list";
  return <div className={styles.workspace}><p className={styles.privacy}>Choices stay in this browser. Selection uses the browser’s cryptographic random source.</p><div className={styles.grid}>
    <section className={styles.panel}><h2>Paste choices</h2><div className={styles.field}><label htmlFor="picker-options">Paste choices — one per line</label><textarea id="picker-options" value={input} onChange={event=>{setInput(event.target.value);setResults([]);setMessage("")}} placeholder={"Pizza\nSushi\nIndian\nThai\nBurger"}/></div>
      <fieldset className={styles.modeSwitch}><legend>Choose an action</legend>{([['one','Pick one'],['several','Pick several'],['shuffle','Shuffle list']] as const).map(([value,label])=><label key={value}><input type="radio" name="picker-mode" value={value} checked={mode===value} onChange={()=>{setMode(value);setResults([]);setMessage("")}}/> {label}</label>)}</fieldset>
      {mode==="several"&&<div className={styles.field}><label htmlFor="picker-count">How many?</label><input id="picker-count" type="number" min="2" max={Math.max(2,choices.length)} value={pickCount} onChange={event=>setPickCount(Math.max(2,Number(event.target.value)||2))}/><small>{choices.length>=2?`Choose between 2 and ${choices.length}.`:"Add choices first."}</small></div>}
      <details className={styles.advanced}><summary>More options</summary>{mode!=="shuffle"&&<label className={styles.check}><input type="checkbox" checked={removeAfter} onChange={event=>setRemoveAfter(event.target.checked)}/> Remove selected choices after each pick</label>}<label className={styles.check}><input type="checkbox" checked={rememberList} onChange={event=>setRememberList(event.target.checked)}/> Remember this list</label><p className={styles.inputHint}>Off by default. When enabled, this browser stores the current list on this device.</p></details>
      <div className={styles.actions}><button type="button" className={styles.button} onClick={choose}>{actionLabel}</button><button type="button" className={styles.button} data-quiet onClick={clear}>Clear</button></div><p>{choices.length} {choices.length===1?"choice":"choices"}</p><p className={styles.status} data-error={Boolean(message)} role="status">{message}</p>
    </section>
    <section ref={resultRef} className={styles.panel}><h2>{mode==="shuffle"?"Shuffled list":"Selected"}</h2>{results.length?<><div className={styles.resultHero}><span className={styles.resultLabel}>{mode==="shuffle"?"New order":results.length===1?"Selected":"Selections"}</span>{results.length===1?<p className={styles.winner}>{results[0]}</p>:<ol className={styles.pickerResults}>{results.map((result,index)=><li key={`${result}-${index}`}><span>{String(index+1).padStart(2,"0")}</span>{result}</li>)}</ol>}<p aria-live="polite">{mode==="shuffle"?`${results.length} choices shuffled.`:`${results.length} ${results.length===1?"choice":"choices"} selected.`}</p></div><div className={styles.actions}><button type="button" className={styles.button} onClick={choose}>{mode==="shuffle"?"Shuffle again":"Pick again"}</button>{mode!=="shuffle"&&<button type="button" className={styles.button} data-quiet onClick={removeAndChoose}>Remove and pick again</button>}<button type="button" className={styles.copyTextAction} onClick={()=>void copy()}>{copied?"Copied":"Copy result"}</button></div></>:<p>{mode==="shuffle"?"The shuffled list will appear here.":"The selected choice will appear here."}</p>}</section>
  </div></div>;
}
