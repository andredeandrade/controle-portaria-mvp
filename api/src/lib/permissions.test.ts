import { describe, expect, it } from 'vitest'
import { hasPermission } from './permissions.js'

describe('lib/permissions', () => {
  it('ADMIN tem CRUD completo nos domínios e acesso a relatórios', () => {
    expect(hasPermission('ADMIN', 'residents', 'create')).toBe(true)
    expect(hasPermission('ADMIN', 'visitors', 'remove')).toBe(true)
    expect(hasPermission('ADMIN', 'authorizations', 'update')).toBe(true)
    expect(hasPermission('ADMIN', 'reports', 'view')).toBe(true)
  })

  it('GESTOR tem o mesmo acesso operacional do ADMIN nos domínios, acessos e relatórios', () => {
    expect(hasPermission('GESTOR', 'residents', 'create')).toBe(true)
    expect(hasPermission('GESTOR', 'service-providers', 'remove')).toBe(true)
    expect(hasPermission('GESTOR', 'events', 'registerAccess')).toBe(true)
    expect(hasPermission('GESTOR', 'access-records', 'checkIn')).toBe(true)
    expect(hasPermission('GESTOR', 'access-records', 'checkOut')).toBe(true)
    expect(hasPermission('GESTOR', 'reports', 'view')).toBe(true)
  })

  it('SEGURANCA (portaria) só visualiza cadastros e não acessa relatórios', () => {
    expect(hasPermission('SEGURANCA', 'residents', 'view')).toBe(true)
    expect(hasPermission('SEGURANCA', 'residents', 'create')).toBe(false)
    expect(hasPermission('SEGURANCA', 'visitors', 'update')).toBe(false)
    expect(hasPermission('SEGURANCA', 'authorizations', 'remove')).toBe(false)
    expect(hasPermission('SEGURANCA', 'reports', 'view')).toBe(false)
  })

  it('SEGURANCA registra entradas/saídas, convidados e cria ocorrências', () => {
    expect(hasPermission('SEGURANCA', 'access-records', 'checkIn')).toBe(true)
    expect(hasPermission('SEGURANCA', 'access-records', 'checkOut')).toBe(true)
    expect(hasPermission('SEGURANCA', 'events', 'registerAccess')).toBe(true)
    expect(hasPermission('SEGURANCA', 'incidents', 'create')).toBe(true)
    expect(hasPermission('SEGURANCA', 'incidents', 'remove')).toBe(false)
  })

  it('SINDICO só visualiza registros de acesso', () => {
    expect(hasPermission('SINDICO', 'access-records', 'view')).toBe(true)
    expect(hasPermission('SINDICO', 'access-records', 'checkIn')).toBe(false)
  })
})
