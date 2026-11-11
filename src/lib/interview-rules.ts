export const purposeModules = {
  selection: ['A','B','C','D','F','G'], training: ['A','B','C','D','E','H'], performance: ['A','B','C','H'], compensation: ['A','B','D','F','G','S'], legal: ['A','B','G'], workforce: ['A','B','D'], redesign: ['A','B','D'], other: ['A','B','D'],
} as const;
export type Purpose = keyof typeof purposeModules;
export const purposes: Record<Purpose, string> = { selection: 'Selection / hiring', training: 'Training & development', performance: 'Performance management', compensation: 'Compensation / job evaluation', legal: 'Legal / ADA documentation', workforce: 'Workforce / succession planning', redesign: 'Job redesign', other: 'Other' };
export const modules: Record<string, {name:string; questions: string[]}> = {
 A:{name:'Role context',questions:['Purpose of the role in one sentence','Reporting line and direct reports (none if applicable)','Key internal and external contacts','Schedule','Location / remote arrangement']},
 B:{name:'Tasks',questions:['Task / main duty','Frequency','Importance (1–5)','Consequence of error','Time spent (%)','Required on day one or learned on the job?']},
 C:{name:'Critical incidents',questions:['Excellent performance: situation','Excellent performance: actions','Excellent performance: outcome','Poor performance: situation','Poor performance: actions','Poor performance: outcome']},
 D:{name:'KSAOs',questions:['Knowledge, skills, abilities or other characteristics needed','Required at entry versus trainable','Task(s) supported — use saved task evidence codes']},
 E:{name:'Tools & technology',questions:['Systems and software','Equipment','Certifications / licenses (none if applicable)']},
 F:{name:'Decision authority & judgment',questions:['Decisions made alone','Decisions requiring approval','Limits: money, exceptions or other boundaries']},
 G:{name:'Work context',questions:['Physical demands and environment','Pace and emotional demands','Travel (none if applicable)','Essential functions — identify tasks and why they are essential']},
 H:{name:'Performance standards',questions:['How success is measured','Targets / metrics','Fully proficient performance after 6–12 months']},
 I:{name:'Change & future',questions:['Changes over the next 1–2 years','Tasks or technology affected','Expected new capability needs']},
 S:{name:'Scope',questions:['Budget responsibility','Headcount responsibility','Organizational impact']},
};
export type Answer = {id:string; module:string; source_id:string; values: Record<string,string>; evidence_id:string; created_at:string};
export function requiredModules(selected: readonly Purpose[]) { return [...new Set(selected.flatMap(p => [...purposeModules[p]]))].sort(); }
export function completeAnswer(module:string, values:Record<string,string>) {
 const definition=modules[module];
 if (!definition || !definition.questions.every((_,i)=>typeof values[String(i)]==='string' && (values[String(i)]??'').trim().length>0)) return false;
 if(module==='B') return /^([1-5])$/.test(values['2']??'') && Number.isFinite(Number(values['4'])) && Number(values['4'])>=0 && Number(values['4'])<=100;
 return true;
}
export function coverage(selected: readonly Purpose[], incumbents:number, answers:Answer[]) {
 return requiredModules(selected).map(module=>{
  const rows=answers.filter(a=>a.module===module);
  const sources=new Set(rows.filter(a=>completeAnswer(module,a.values)).map(a=>a.source_id)).size;
  const covered=sources >= (incumbents===1?1:2);
  return {module, sources, status:covered?'covered':rows.length?'partial':'not started', limited:covered&&sources===1};
 });
}
export function outputChoices(selected: readonly Purpose[]) {
 const map:Record<Purpose,string[]>={selection:['Competency summary','Hiring materials'],training:['Training-needs summary','Training plan'],performance:['Performance standards','Evaluation criteria'],compensation:['Role-scope summary','Job-evaluation summary'],legal:['Essential-functions documentation','Work-demands summary'],workforce:['Capability needs summary','Succession needs summary'],redesign:['Task redesign summary'],other:['Confirmed custom deliverable']};
 return [...new Set(selected.flatMap(p=>map[p]))];
}
export function canDraft(selected:readonly Purpose[], incumbents:number, answers:Answer[], status:string, conflicts:number) {return selected.length>0 && coverage(selected,incumbents,answers).every(c=>c.status==='covered') && status==='approved' && conflicts===0;}