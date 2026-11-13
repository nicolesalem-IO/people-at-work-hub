import {defaultSettings,type Person,type Assignment,type AuditEvent} from '@/lib/admin-rules';
import {assessmentDemo} from './assessment-demo';
export const demoPeople:Person[]=[
 {id:'nicole',user_id:null,name:'Nicole',email:'nicole@example.test',roles:['admin','analyst'],status:'active',last_active:null},
 {id:'maya',user_id:null,name:'Maya Chen',email:'maya@example.test',roles:['hr'],status:'active',last_active:null},
 {id:'daniel',user_id:null,name:'Daniel Okafor',email:'daniel@example.test',roles:['hiring_manager','sme'],status:'active',last_active:null},
 {id:'priya',user_id:null,name:'Priya Shah',email:'priya@example.test',roles:['sme'],status:'active',last_active:null},
 {id:'lena',user_id:null,name:'Lena Park',email:'lena@example.test',roles:['rater'],status:'active',last_active:null},
 {id:'sam',user_id:null,name:'Sam Ortiz',email:'sam@example.test',roles:['rater'],status:'active',last_active:null},
];
export const demoAssignments:Assignment[]=[
 {id:'dm',person_id:'daniel',role_id:assessmentDemo.id,permission:'hiring_manager',source_id:''},
 {id:'ds',person_id:'daniel',role_id:assessmentDemo.id,permission:'sme',source_id:'daniel'},
 {id:'ps',person_id:'priya',role_id:assessmentDemo.id,permission:'sme',source_id:'priya'},
 {id:'lr',person_id:'lena',role_id:assessmentDemo.id,permission:'rater',source_id:''},
 {id:'sr',person_id:'sam',role_id:assessmentDemo.id,permission:'rater',source_id:''},
];
export const demoSettings={...defaultSettings};
export const demoAudit:AuditEvent[]=[];