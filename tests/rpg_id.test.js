'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto'),{uuid}=require('../public/rpg_id');
test('identificadores continuam válidos sem randomUUID, como no acesso HTTP',()=>{const source={getRandomValues:a=>webcrypto.getRandomValues(a)},ids=Array.from({length:1000},()=>uuid(source));assert.equal(new Set(ids).size,1000);assert.ok(ids.every(id=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)));});
test('usa gerador nativo quando disponível e não usa Math.random como substituto',()=>{assert.equal(uuid({randomUUID:()=> 'native'}),'native');assert.throws(()=>uuid({}),/HTTPS/);});
