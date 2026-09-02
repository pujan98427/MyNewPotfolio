"use client";

import {useId,useState} from "react";
import styles from "./file-drop-zone.module.css";

type FileDropZoneProps={accept:string;title:string;restrictions:string;multiple?:boolean;disabled?:boolean;onFiles:(files:File[])=>void};

export function FileDropZone({accept,title,restrictions,multiple=false,disabled=false,onFiles}:FileDropZoneProps){
  const inputId=useId(),helpId=`${inputId}-help`,[dragging,setDragging]=useState(false);
  const deliver=(files:FileList|null)=>{if(!files?.length)return;onFiles(Array.from(files));};
  return <label className={styles.zone} data-dragging={dragging||undefined} htmlFor={inputId} onDragEnter={event=>{event.preventDefault();if(!disabled)setDragging(true)}} onDragOver={event=>{event.preventDefault();event.dataTransfer.dropEffect=disabled?"none":"copy"}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setDragging(false)}} onDrop={event=>{event.preventDefault();setDragging(false);if(!disabled)deliver(event.dataTransfer.files)}}>
    <input className={styles.input} id={inputId} type="file" accept={accept} multiple={multiple} disabled={disabled} aria-describedby={helpId} onChange={event=>{deliver(event.target.files);event.target.value=""}}/>
    <span><strong className={styles.title}>{dragging?"Drop files here":title}</strong><span className={styles.action}>Choose {multiple?"files":"file"}</span><small className={styles.restrictions} id={helpId}>{restrictions}</small></span>
  </label>;
}
