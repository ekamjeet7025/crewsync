import { test } from 'node:test';
import assert from 'node:assert/strict';
import { text, date, objectId, own, ensure, AppError } from '../server/service.js';
test('valid text is trimmed; missing or oversized text is rejected',()=>{assert.equal(text('  hello  ','Name'),'hello'); for(const value of [undefined,null,'',{},'x'.repeat(121)]) assert.throws(()=>text(value,'Name'),AppError)});
test('dates must be valid string timestamps',()=>{assert.equal(date('2030-01-01T00:00:00Z','Start').getUTCFullYear(),2030);for(const value of ['not-a-date',null,123,{}])assert.throws(()=>date(value,'Start'),AppError)});
test('only 24-character hexadecimal resource identifiers are accepted',()=>{assert.equal(objectId('0123456789abcdef01234567'),'0123456789abcdef01234567');for(const value of ['not-id','',undefined,{$ne:null}])assert.throws(()=>objectId(value),AppError)});
test('resource ownership distinguishes missing events from forbidden access',()=>{assert.throws(()=>own(null,{_id:'a'}),e=>e.status===404);assert.throws(()=>own({owner:'a'},{_id:'b'}),e=>e.status===403);assert.doesNotThrow(()=>own({owner:'a'},{_id:'a'}))});
test('domain errors retain their HTTP status and actionable message',()=>{assert.throws(()=>ensure(false,409,'Shift full'),e=>e.status===409&&e.message==='Shift full');assert.doesNotThrow(()=>ensure(true,400,'unused'))});

