import {describe,it,expect} from 'vitest';
import {assessmentDemo,benchmark} from '../data/assessment-demo';
import {eligibleKsaos,weights,objectiveScore,raterDisagreement,angoffCut,composite,adverseImpact,analysisGaps,batteryGaps} from '../lib/assessment-rules';
const kind=(id:string)=>benchmark.elements.find(e=>e.id===id)?.kind??'';
describe('candidate assessment rules',()=>{
 it('selection excludes trainable knowledge and includes importance at least four',()=>{const ks=eligibleKsaos(assessmentDemo,kind);expect(ks.map(k=>k.id)).not.toContain('2.C.3.a');expect(ks.map(k=>k.id)).toContain('2.C.6');expect(ks.every(k=>k.importance>=4)).toBe(true);});
 it('applicability disagreement prevents inclusion',()=>{const a=structuredClone(assessmentDemo);const r=a.ratings.find(r=>r.element_id==='2.C.6');if(r)r.applies=false;expect(eligibleKsaos(a,kind).map(k=>k.id)).not.toContain('2.C.6');});
 it('method weights split importance and total 100',()=>{const w=weights(assessmentDemo,eligibleKsaos(assessmentDemo,kind));expect(Object.values(w).reduce((n,x)=>n+x,0)).toBeCloseTo(100);expect(w.interview).toBe(0);});
 it('two distinct sources are required',()=>{const a=structuredClone(assessmentDemo);a.ratings=a.ratings.filter(r=>r.source_id==='priya');expect(analysisGaps(a)).toContain('Second-source ratings');});
 it('uncovered KSAO blocks submission',()=>{const a=structuredClone(assessmentDemo);a.mappings=[];expect(batteryGaps(a,eligibleKsaos(a,kind))).toContain('Uncovered KSAO');});
 it('objective answers use exact approved answer key',()=>{const i=assessmentDemo.items.find(i=>i.id==='num-1');expect(i).toBeDefined();if(!i)return;expect(objectiveScore(i,'2')).toBe(100);expect(objectiveScore(i,'0')).toBe(0);expect(objectiveScore(i,' ')).toBe(0);});
 it('SJT agreement normalizes four 1–5 options',()=>{const i=assessmentDemo.items.find(i=>i.id==='sjt-1');if(!i)throw Error('missing');expect(objectiveScore(i,'1,5,2,5')).toBe(100);expect(objectiveScore(i,'5,1,5,1')).toBe(6.25);});
 it('rater disagreement over one point is flagged',()=>{expect(raterDisagreement([4,4],[3,3])).toBe(false);expect(raterDisagreement([4,4],[2,4])).toBe(true);});
 it('Angoff averages minimally qualified candidate estimates',()=>{expect(angoffCut([60,65])).toBe(62.5);expect(angoffCut([101])).toBeNull();});
 it('pending human scores do not become zero',()=>{expect(composite({aptitude:80},{work_sample:50,aptitude:50,sjt:0,knowledge:0,interview:0})).toBeNull();});
 it('four-fifths flags ratios below 0.8',()=>{const r=adverseImpact([{group:'A',pass:true},{group:'A',pass:true},{group:'B',pass:true},{group:'B',pass:false}]);expect(r.find(g=>g.group==='B')).toMatchObject({ratio:0.5,flag:true,small:true});});
});