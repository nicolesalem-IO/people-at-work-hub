import {execFileSync} from 'node:child_process';
import {describe,it,expect} from 'vitest';
describe.sequential('Live interview rules',()=>{
 for(const rule of ['training_modules','incomplete_coverage','purpose_output','review_gate','draft_gate','source_role','evidence_immutable','importance_range'])it(rule,()=>{
  const output=execFileSync('lovable',['supabase','query',`SELECT details FROM public.activity_log WHERE entity_type='interview_rules' AND details->>'rule'='${rule}' ORDER BY created_at DESC LIMIT 1`,'--json'],{encoding:'utf8',timeout:30000});
  const result=JSON.parse(output) as {rows:{details:{rule:string;passed:boolean}}[]};
  expect(result.rows).toHaveLength(1);expect(result.rows[0]?.details).toEqual({rule,passed:true});
 });
});