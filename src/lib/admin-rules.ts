export const orgRoles = {admin:'Admin',hr:'HR',hiring_manager:'Hiring manager',analyst:'I-O analyst',sme:'SME',rater:'Rater'} as const;
export type OrgRole = keyof typeof orgRoles;
export type Person = {id:string;user_id:string|null;name:string;email:string;status:'invited'|'active'|'deactivated';last_active:string|null;roles:OrgRole[]};
export type Assignment = {id:string;person_id:string;role_id:string;permission:'hiring_manager'|'sme'|'rater';source_id:string};
export type OrgSettings = {name:string;logo_path:string;onet_mode:'demo'|'live';candidate_days:number;retention_months:number;privacy_notice:string};
export type AuditEvent = {id:string;actor:string;action:string;entity_type:string;entity_id:string|null;details:unknown;created_at:string};
export const defaultSettings:OrgSettings={name:'People at Work',logo_path:'',onet_mode:'demo',candidate_days:30,retention_months:36,privacy_notice:'Your responses are used to assess job-relevant skills and are reviewed by authorized members of the hiring team. Optional demographic information is kept separate from scoring. Hiring records, including scores and notes, are retained for 36 months. Contact the hiring team with privacy or accommodation questions.'};
export const permissionRows = [
 {key:'people',label:'People, settings & audit',roles:['admin'],assigned:[]},
 {key:'campaigns',label:'Campaigns & candidate invitations',roles:['admin','hr'],assigned:[]},
 {key:'approve',label:'Approve batteries',roles:['admin','hr'],assigned:[]},
 {key:'results',label:'View candidate results',roles:['admin','hr'],assigned:['hiring_manager']},
 {key:'decision',label:'Record hiring decisions',roles:['admin'],assigned:['hiring_manager']},
 {key:'analysis',label:'Job analysis, blueprint & tests',roles:['admin','analyst'],assigned:[]},
 {key:'fairness',label:'Validity & fairness reports',roles:['admin','analyst','hr'],assigned:[]},
 {key:'sme',label:'Expert task/skill ratings & incidents',roles:['admin'],assigned:['sme']},
 {key:'score',label:'Blind work-sample scoring',roles:['admin'],assigned:['rater']},
] as const;
export type Capability = typeof permissionRows[number]['key'];
export function can(person:Person|null,capability:Capability,assigned:readonly string[]=[]){if(!person||person.status!=='active')return false;const row=permissionRows.find(r=>r.key===capability);return Boolean(row&&person.roles.some(role=>(row.roles as readonly string[]).includes(role)||(row.assigned as readonly string[]).includes(role)&&assigned.includes(role)));}
export function validatePersonChange(people:Person[],next:Person){if(!next.roles.length)throw new Error('Choose at least one organization role.');if(people.some(p=>p.id!==next.id&&p.email.toLowerCase()===next.email.toLowerCase()))throw new Error('This email already belongs to a person.');const old=people.find(p=>p.id===next.id);if(old?.status==='active'&&old.roles.includes('admin')&&(next.status!=='active'||!next.roles.includes('admin'))&&!people.some(p=>p.id!==next.id&&p.status==='active'&&p.roles.includes('admin')))throw new Error('Keep at least one active Admin.');}
export function validateAssignment(person:Person,permission:Assignment['permission']){if(person.status!=='active'||!person.roles.includes(permission))throw new Error('Choose an active person with the matching organization role.');}
export function retentionCutoff(now:Date,months:number){const date=new Date(now);const day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()-months);const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));return date;}