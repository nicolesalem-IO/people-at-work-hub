import {describe,it,expect} from 'vitest';
import {campaignDemo,pipelineDemo} from '@/data/pipeline-demo';
import {assessmentDemo} from '@/data/assessment-demo';
import {candidateExpiry,campaignProblem,launchProblem,parseCandidateCsv,pipelineStage,scoreProfiles,shuffled} from '@/lib/pipeline-rules';
import {raterDisagreement} from '@/lib/assessment-rules';
describe('Candidate pipeline rules',()=>{
 it('Launch requires recorded HR approval',()=>{expect(launchProblem({...assessmentDemo,history:[]})).not.toBe('');expect(launchProblem(assessmentDemo)).toBe('');});
 it('Candidate window of 5 days stops at campaign close',()=>{expect(candidateExpiry(new Date('2026-11-11T00:00:00Z'),campaignDemo)).toBe('2026-11-16T00:00:00.000Z');expect(candidateExpiry(new Date('2027-01-30T00:00:00Z'),campaignDemo)).toBe('2027-01-31T23:59:00.000Z');});
 it('Close date follows open date',()=>{expect(campaignProblem({...campaignDemo,closes_at:campaignDemo.opens_at})).not.toBe('');});
 it('CSV flags invalid and duplicate emails',()=>{const rows=parseCandidateCsv('name,email\nA,a@example.test\nB,a@example.test\nC,broken');expect(rows.map(r=>r.error)).toEqual(['','Duplicate email','Valid email required']);});
 it('Five demo candidates occupy requested stages',()=>{expect(pipelineDemo.map(pipelineStage)).toEqual(['Invited','Started','Rater review','Scored','Scored']);});
 it('More than 1 point difference flags disagreement',()=>{expect(raterDisagreement([2,3],[4,3])).toBe(true);expect(raterDisagreement([2,3],[3,3])).toBe(false);});
 it('Two agreeing raters are needed before work-sample scoring',()=>{const scores=scoreProfiles(assessmentDemo,{},[{item_id:'ws-1',user_id:'a',ratings:[4,4],note:'Evidence'}],{});expect(scores.itemScores['ws-1']).toBeUndefined();expect(scores.total).toBeNull();});
 it('Shuffling preserves canonical option IDs',()=>{expect(shuffled(['0','1','2','3'],()=>0)).toEqual(['1','2','3','0']);});
});