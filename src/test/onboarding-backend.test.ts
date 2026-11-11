import {execFileSync} from 'node:child_process';
import {describe,it,expect} from 'vitest';
function query(sql:string){return JSON.parse(execFileSync('lovable',['supabase','query',sql,'--json'],{encoding:'utf8',timeout:30000})) as {rows:Record<string,unknown>[]};}
describe('Onboarding and candidate boundaries',()=>{
 it('Onboarding is owner-scoped and not anonymously readable',()=>{const row=query("SELECT c.relrowsecurity AS secured,has_table_privilege('anon','public.onboarding_drafts','SELECT') AS anonymous FROM pg_class c WHERE c.oid='public.onboarding_drafts'::regclass").rows[0];expect(row).toEqual({secured:true,anonymous:false});});
 it('Candidate token actions cannot be called through the data API',()=>{expect(query("SELECT has_function_privilege('authenticated','public.pipeline_candidate_action(text,text,jsonb)','EXECUTE') AS allowed").rows[0]?.['allowed']).toBe(false);});
 it('HR can review fairness and SMEs cannot read full battery judgments',()=>{const rows=query("SELECT pg_get_functiondef('public.org_can(text,uuid)'::regprocedure) AS definition,(SELECT qual FROM pg_policies WHERE tablename='assessment_batteries' AND policyname='battery_read') AS policy").rows[0];expect(rows?.['definition']).toMatch(/WHEN 'fairness'.*org_has_role.*'hr'/s);expect(rows?.['policy']).toBe("org_can('analysis'::text, id)");});
 it('Optional fairness information is accepted only after submission',()=>{expect(query("SELECT pg_get_functiondef('public.pipeline_candidate_action(text,text,jsonb)'::regprocedure) AS definition").rows[0]?.['definition']).toContain("IF a.status NOT IN ('submitted','scored') THEN RAISE EXCEPTION 'Optional fairness information is available after submission'");});
 it('Partial SJT responses can autosave without inventing ratings',()=>{expect(query("SELECT pg_get_functiondef('public.pipeline_candidate_action(text,text,jsonb)'::regprocedure) AS definition").rows[0]?.['definition']).toContain('^[1-5]?,[1-5]?,[1-5]?,[1-5]?$');});
});
