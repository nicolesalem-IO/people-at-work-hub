import {Info} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from '@/components/ui/tooltip';
import {glossary} from '@/lib/plain-language';
export function Term({label}:{label:string}){const term=glossary.find(t=>t.label===label);return <span className="inline-flex items-center gap-1 max-w-full"><span>{label}</span>{term&&<TooltipProvider delayDuration={150}><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-6 shrink-0" aria-label={`Technical term for ${label}`}><Info className="size-3.5"/></Button></TooltipTrigger><TooltipContent className="max-w-xs">{term.technical} · {term.definition}</TooltipContent></Tooltip></TooltipProvider>}</span>;}
