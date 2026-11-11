import {describe,it,expect} from 'vitest';
import {can,defaultSettings,validatePersonChange,validateAssignment,retentionCutoff,type Person} from '@/lib/admin-rules';
import {demoPeople} from '@/data/admin-demo';
const p=(roles:Person['roles']):Person=>({...demoPeople[0],id:'test',roles});
describe('Organization permission rules',()=>{
 it('Admin can manage people, approve and score',()=>{for(const action of ['people','approve','score'] as const)expect(can(p(['admin']),action)).toBe(true);});
 it('HR can create campaigns, invite candidates, approve and view results but cannot edit or score',()=>{for(const action of ['campaigns','approve','results'] as const)expect(can(p(['hr']),action)).toBe(true);expect(can(p(['hr']),'analysis')).toBe(false);expect(can(p(['hr']),'score')).toBe(false);});
 it('Hiring manager can view and decide only assigned roles and cannot edit tests or scores',()=>{for(const action of ['results','decision'] as const){expect(can(p(['hiring_manager']),action)).toBe(false);expect(can(p(['hiring_manager']),action,['hiring_manager'])).toBe(true);}expect(can(p(['hiring_manager']),'analysis',['hiring_manager'])).toBe(false);expect(can(p(['hiring_manager']),'score',['hiring_manager'])).toBe(false);});
 it('Analyst can analyze and report fairness, not invite, approve, decide or score',()=>{expect(can(p(['analyst']),'analysis')).toBe(true);expect(can(p(['analyst']),'fairness')).toBe(true);for(const action of ['campaigns','approve','decision','score'] as const)expect(can(p(['analyst']),action)).toBe(false);});
 it('SME judgments require an assigned role',()=>{expect(can(p(['sme']),'sme')).toBe(false);expect(can(p(['sme']),'sme',['sme'])).toBe(true);});
 it('Rater scoring requires an assignment and does not grant candidate results',()=>{expect(can(p(['rater']),'score')).toBe(false);expect(can(p(['rater']),'score',['rater'])).toBe(true);expect(can(p(['rater']),'results',['rater'])).toBe(false);});
 it('Multiple organization roles combine',()=>{expect(can(p(['analyst','hr']),'analysis')).toBe(true);expect(can(p(['analyst','hr']),'approve')).toBe(true);});
 it('Deactivated people cannot act even with Admin',()=>{expect(can({...p(['admin']),status:'deactivated'},'people')).toBe(false);});
 it('Last active Admin cannot lose Admin or be deactivated',()=>{expect(()=>validatePersonChange(demoPeople,{...demoPeople[0],roles:['analyst']})).toThrow('active Admin');expect(()=>validatePersonChange(demoPeople,{...demoPeople[0],status:'deactivated'})).toThrow('active Admin');});
 it('Daniel holds hiring manager, SME and Rater roles',()=>{expect(demoPeople.find(p=>p.id==='daniel')?.roles).toEqual(['hiring_manager','sme','rater']);});
 it('Per-job assignments need matching active organization role',()=>{expect(()=>validateAssignment(p(['sme']),'rater')).toThrow();expect(()=>validateAssignment(p(['sme']),'sme')).not.toThrow();});
 it('Candidate retention defaults to 12 months',()=>{expect(defaultSettings.retention_months).toBe(12);expect(retentionCutoff(new Date('2026-11-11T00:00:00Z'),12).toISOString()).toBe('2025-11-11T00:00:00.000Z');});
});