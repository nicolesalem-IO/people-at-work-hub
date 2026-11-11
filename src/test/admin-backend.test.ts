import {execFileSync} from 'node:child_process';
import {describe,it,expect} from 'vitest';
function query(sql:string){return JSON.parse(execFileSync('lovable',['supabase','query',sql,'--json'],{encoding:'utf8',timeout:30000})) as {rows:Record<string,unknown>[]};}
describe('Admin database boundaries',()=>{
 it('Raters cannot directly read answer keys or submit computed scores',()=>{expect(query("SELECT has_function_privilege('authenticated','public.org_score_snapshot(uuid,text)','EXECUTE') AS snapshot,has_function_privilege('authenticated','public.org_store_score(uuid,jsonb,jsonb,jsonb,jsonb,text,text)','EXECUTE') AS scores").rows[0]).toEqual({snapshot:false,scores:false});});
 it('People cannot be hard-deleted',()=>{expect(query("SELECT has_table_privilege('authenticated','public.org_people','DELETE') AS allowed").rows[0]?.['allowed']).toBe(false);});
 it('Candidate data retention defaults to 12 months',()=>{expect(query("SELECT column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='org_settings' AND column_name='retention_months'").rows[0]?.['column_default']).toBe('12');});
 it('Organization people and roles have row security',()=>{const rows=query("SELECT relname,relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND relname IN ('org_people','org_person_roles','org_assignments','org_settings','org_invitations')").rows;expect(rows).toHaveLength(5);for(const row of rows)expect(row['relrowsecurity']).toBe(true);});
});