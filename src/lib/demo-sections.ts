import type {Assessment,Method} from './assessment-rules';
export const demoSections=[
 {name:'Numerical reasoning',count:8,minutes:12,unit:'items',method:'aptitude'},
 {name:'Verbal reasoning',count:8,minutes:10,unit:'items',method:'aptitude'},
 {name:'Logical reasoning',count:8,minutes:10,unit:'items',method:'aptitude'},
 {name:'Job knowledge',count:10,minutes:8,unit:'items',method:'knowledge'},
 {name:'Situational judgment',count:10,minutes:15,unit:'scenarios',method:'sjt'},
 {name:'Work samples',count:2,minutes:40,unit:'exercises',method:'work_sample'},
] as const;
export function sectionOverview(sections:{name:string;minutes:number;count:number;completed:boolean;practice_completed:boolean}[],demo:boolean){return sections.map(s=>{const spec=demo?demoSections.find(x=>x.name===s.name):undefined;return {...s,count:spec?.count??s.count,unit:spec?.unit??'items',shown:demo?s.count:undefined};});}
export function methodMinutes(a:Assessment,m:Method){return a.items.filter(i=>i.method===m&&!i.practice&&i.status!=='retired').reduce((n,i)=>n+i.minutes,0);}
export function canOfferOptionalGroup(status:string){return status==='submitted'||status==='scored';}