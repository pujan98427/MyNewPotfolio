"use client";

import {useId,useState} from "react";

type FileDropZoneProps={accept:string;title:string;restrictions:string;actionLabel?:string;multiple?:boolean;disabled?:boolean;onFiles:(files:File[])=>void};

export function FileDropZone({accept,title,restrictions,actionLabel,multiple=false,disabled=false,onFiles}:FileDropZoneProps){
  const inputId=useId(),helpId=`${inputId}-help`,[dragging,setDragging]=useState(false);
  const deliver=(files:FileList|null)=>{if(!files?.length)return;onFiles(Array.from(files));};
  return <label
    className="
      relative grid min-h-44 cursor-pointer place-items-center border border-dashed
      border-control-border bg-transparent p-5 text-center
      transition-[border-color,background-color] duration-fast ease-smooth
      hover:border-brand-strong hover:bg-brand-soft
      focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-focus-ring
      focus-within:shadow-[0_0_0_6px_var(--color-focus-halo)]
      data-[dragging=true]:border-brand-strong data-[dragging=true]:bg-brand-soft
      data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-[.55]
      max-[768px]:min-h-36 motion-reduce:transition-none
    "
    data-dragging={dragging||undefined}
    data-disabled={disabled||undefined}
    htmlFor={inputId}
    onDragEnter={event=>{event.preventDefault();if(!disabled)setDragging(true)}}
    onDragOver={event=>{event.preventDefault();event.dataTransfer.dropEffect=disabled?"none":"copy"}}
    onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setDragging(false)}}
    onDrop={event=>{event.preventDefault();setDragging(false);if(!disabled)deliver(event.dataTransfer.files)}}
  >
    <input
      className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip:rect(0,0,0,0)]"
      id={inputId}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      aria-describedby={helpId}
      onChange={event=>{deliver(event.target.files);event.target.value=""}}
    />
    <span>
      <strong className="mb-[.4rem] block font-bold">{dragging?"Drop files here":title}</strong>
      <span className="block underline underline-offset-[.22em] max-[768px]:inline-flex max-[768px]:min-h-11 max-[768px]:items-center">
        {actionLabel??`Choose ${multiple?"files":"file"}`}
      </span>
      <small className="mt-[.65rem] block max-w-lg text-[.78rem] leading-[1.45] text-muted" id={helpId}>{restrictions}</small>
    </span>
  </label>;
}
