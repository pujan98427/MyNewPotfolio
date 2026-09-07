const detail=(failure:unknown)=>failure instanceof Error?`${failure.name} ${failure.message}`.toLowerCase():"";

export function imageToolError(failure:unknown){
  const message=detail(failure);
  if(/memory|allocation|quota|too large|out of memory/.test(message))return "This image is too large for this browser to process safely. Try a smaller image or reduce its dimensions first.";
  if(/decode|unsupported|format|imagebitmap/.test(message))return "I couldn't open this image. Try JPG, PNG or WebP instead.";
  if(/encode|canvas|blob/.test(message))return "I couldn't create the new image. Try JPG, PNG or WebP, or choose a smaller image.";
  return "I couldn't process this image. Your original file has not been changed. Try another supported image or a different output format.";
}

export function svgToolError(action:"encode"|"decode"){
  return action==="encode"
    ?"I couldn't read this SVG. Check that it contains complete <svg> markup and try again."
    :"I couldn't decode this value. Paste raw SVG Base64 or a complete SVG data URI and try again.";
}
