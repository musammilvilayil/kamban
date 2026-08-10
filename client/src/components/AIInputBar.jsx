import { Mic, Send, Sparkles, Square } from "lucide-react";
import { useRef, useState } from "react";

function AIInputBar({onCreateTask,loading}){
 const[prompt,setPrompt]=useState("");
 const[listening,setListening]=useState(false);
 const recognitionRef=useRef(null);

 const submitPrompt=async(e)=>{e.preventDefault();const value=prompt.trim();if(!value||loading)return;await onCreateTask(value);setPrompt("")};

 const toggleVoice=()=>{
  const SpeechRecognition=window.webkitSpeechRecognition;
  if(!SpeechRecognition){window.alert("Voice input is not supported in this browser. Try Chrome or Edge.");return}
  if(listening&&recognitionRef.current){recognitionRef.current.stop();return}

  const recognition=new SpeechRecognition();
  recognition.continuous=false;
  recognition.interimResults=false;
  recognition.lang="en-US";
  recognition.onstart=()=>setListening(true);
  recognition.onend=()=>setListening(false);
  recognition.onerror=()=>setListening(false);
  recognition.onresult=e=>{const transcript=e.results[0]?.[0]?.transcript||"";setPrompt(current=>`${current} ${transcript}`.trim())};
  recognitionRef.current=recognition;
  recognition.start();
 };

 return <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 sm:bottom-4 sm:px-4 sm:pb-0 sm:pt-0 lg:left-64">
  {listening&&<div className="mx-auto mb-2 flex w-fit items-center gap-2 rounded-full border border-rose-200 bg-white/95 px-3 py-2 text-xs font-semibold text-rose-600 shadow-lg backdrop-blur">
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70"/>
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500"/>
    </span>
    <span>Listening…</span>
    <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
      <span className="h-2 w-0.5 animate-pulse rounded-full bg-rose-400"/>
      <span className="h-4 w-0.5 animate-pulse rounded-full bg-rose-500 [animation-delay:120ms]"/>
      <span className="h-3 w-0.5 animate-pulse rounded-full bg-rose-400 [animation-delay:240ms]"/>
      <span className="h-4 w-0.5 animate-pulse rounded-full bg-rose-500 [animation-delay:360ms]"/>
    </span>
  </div>}
  <form onSubmit={submitPrompt} className={`mx-auto flex max-w-3xl items-center gap-1.5 rounded-2xl border bg-white/95 p-1.5 shadow-2xl backdrop-blur transition sm:gap-2 sm:p-2 ${listening?"border-rose-300 shadow-rose-200/50":"border-slate-200 shadow-slate-300/50"}`}>
    <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 sm:grid"><Sparkles size={18}/></div>
    <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={listening?"Listening to your voice…":"Create a task with AI..."} className="h-11 min-w-0 flex-1 bg-transparent px-2 text-[16px] outline-none placeholder:text-slate-400 sm:text-sm"/>
    <button type="button" onClick={toggleVoice} aria-label={listening?"Stop listening":"Start voice input"} className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl transition sm:h-10 sm:w-10 ${listening?"bg-rose-500 text-white shadow-lg shadow-rose-200":"text-slate-500 hover:bg-slate-100"}`}>
      {listening&&<><span className="absolute inset-0 animate-ping rounded-xl bg-rose-400 opacity-20"/><span className="absolute -inset-1 animate-pulse rounded-2xl border border-rose-300"/></>}
      <span className="relative">{listening?<Square size={15}/>:<Mic size={18}/>}</span>
    </button>
    <button type="submit" disabled={loading||!prompt.trim()} aria-label="Create task with AI" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"><Send size={17}/></button>
  </form>
 </div>
}
export default AIInputBar;
