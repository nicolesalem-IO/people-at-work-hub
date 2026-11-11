import {describe,it,expect} from 'vitest';
import {initialSetup,setupProblem,benchmarkMatches,onboardingSchema} from '@/lib/onboarding-rules';
describe('First-run setup',()=>{
it('Requires a practitioner preference without granting privileges',()=>{expect(setupProblem(initialSetup)).toBe('Choose your role.');expect(onboardingSchema.parse({...initialSetup,persona:'hr'})).not.toHaveProperty('roles');});
it('Requires job title organization and at least one opening',()=>{expect(setupProblem({...initialSetup,step:2,title:'Specialist',organization:'Northwind',openings:0})).not.toBe('');expect(setupProblem({...initialSetup,step:2,title:'Specialist',organization:'Northwind',openings:1})).toBe('');});
it('Requires at least two SMEs',()=>{expect(setupProblem({...initialSetup,step:4,smes:[{name:'A',email:'a@example.test',type:'incumbent'}]})).not.toBe('');expect(setupProblem({...initialSetup,step:4,smes:[{name:'A',email:'a@example.test',type:'incumbent'},{name:'B',email:'b@example.test',type:'supervisor'}]})).toBe('');});
it('Returns three saved matches ordered by job title relevance',()=>{expect(benchmarkMatches('Training and development')[0]?.code).toBe('13-1151.00');expect(benchmarkMatches('warehouse')).toHaveLength(3);});
it('Persists completion and the current step',()=>{const saved=onboardingSchema.parse({...initialSetup,step:5,completed:true});expect(saved.step).toBe(5);expect(saved.completed).toBe(true);});
});