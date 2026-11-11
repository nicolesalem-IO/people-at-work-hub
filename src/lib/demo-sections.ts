import type {Assessment,Method} from './assessment-rules';
export const demoSections=[
 {name:'Numerical reasoning',count:4,minutes:6,unit:'items',method:'aptitude'},
 {name:'Verbal reasoning',count:4,minutes:6,unit:'items',method:'aptitude'},
 {name:'Logical reasoning',count:4,minutes:6,unit:'items',method:'aptitude'},
 {name:'Job scenarios',count:8,minutes:7,unit:'scenarios',method:'sjt'},
 {name:'Hands-on tasks',count:2,minutes:40,unit:'exercises',method:'work_sample'},
 {name:'Structured interview',count:5,minutes:30,unit:'questions',method:'interview'},
] as const;
export function sectionOverview(sections:{name:string;minutes:number;count:number;completed:boolean;practice_completed:boolean}[],demo:boolean){return sections.map(s=>{const spec=demo?demoSections.find(x=>x.name===s.name):undefined;return {...s,count:spec?.count??s.count,unit:spec?.unit??'items',shown:demo?s.count:undefined};});}
export function methodMinutes(a:Assessment,m:Method){return a.items.filter(i=>i.method===m&&!i.practice&&i.status!=='retired').reduce((n,i)=>n+i.minutes,0);}
export function canOfferOptionalGroup(status:string){return status==='submitted'||status==='scored';}