import {ArrowRight,FolderPlus} from 'lucide-react';
import {Button} from '@/components/ui/button';
export function EmptyState({message,action,onAction}:{message:string;action:string;onAction:()=>void}){return <div className="empty-state"><span className="empty-state-icon"><FolderPlus aria-hidden="true"/></span><p>{message}</p><Button onClick={onAction}>{action} <ArrowRight/></Button></div>;}