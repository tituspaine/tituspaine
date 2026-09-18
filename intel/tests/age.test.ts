import {describe,it,expect} from 'vitest';import {parsePrivateDob,isAdultDob} from '../src/age';
describe('private DOB age gate',()=>{
 const now=new Date('2026-09-18T16:00:00Z');
 it('accepts the exact eighteenth birthday',()=>expect(isAdultDob('2008-09-18',now)).toBe(true));
 it('rejects one day under eighteen',()=>expect(isAdultDob('2008-09-19',now)).toBe(false));
 it('handles leap-day birthdays by calendar cutoff',()=>{expect(isAdultDob('2008-02-29',new Date('2026-02-28T12:00:00Z'))).toBe(false);expect(isAdultDob('2008-02-29',new Date('2026-03-01T00:00:00Z'))).toBe(true);});
 it('rejects impossible, malformed and future dates',()=>{for(const x of ['2007-02-29','2026-13-01','2026-09-31','09/18/2005','2030-01-01',''])expect(isAdultDob(x,now)).toBe(false);});
 it('parses only real UTC calendar dates',()=>{expect(parsePrivateDob('2005-08-16')?.toISOString()).toContain('2005-08-16');expect(parsePrivateDob('2005-02-30')).toBeNull();});
});
