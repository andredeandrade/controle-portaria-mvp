import { describe, expect, it } from 'vitest'
import { decryptText, encryptText } from './crypto.js'

describe('lib/crypto (usado pelos services para PII)', () => {
  it('faz round-trip de texto simples, acentuado e emoji', () => {
    const samples = ['123.456.789-00', 'joão.silva@exemplo.com', 'Observação: portão 2 ✅']

    for (const sample of samples) {
      expect(decryptText(encryptText(sample))).toBe(sample)
    }
  })

  it('usa IV aleatório: o mesmo texto gera cifras diferentes', () => {
    const plain = 'ABC1D23'

    expect(encryptText(plain)).not.toBe(encryptText(plain))
  })

  it('gera payload iv:authTag:cifra em base64 (IV de 12 bytes, tag de 16), sem o texto puro', () => {
    const plain = 'documento-ficticio-98765'
    const payload = encryptText(plain)
    const [iv, authTag, encrypted] = payload.split(':')

    expect(Buffer.from(iv ?? '', 'base64')).toHaveLength(12)
    expect(Buffer.from(authTag ?? '', 'base64')).toHaveLength(16)
    expect(Buffer.from(encrypted ?? '', 'base64').length).toBeGreaterThan(0)
    expect(payload).not.toContain(plain)
  })

  it('rejeita payload adulterado (auth tag do GCM)', () => {
    const [iv, authTag, encrypted] = encryptText('telefone 11 99999-0000').split(':')
    const bytes = Buffer.from(encrypted ?? '', 'base64')
    bytes[0] = (bytes[0] ?? 0) ^ 0xff
    const tampered = `${iv}:${authTag}:${bytes.toString('base64')}`

    expect(() => decryptText(tampered)).toThrow()
  })

  it('rejeita payload malformado', () => {
    expect(() => decryptText('texto-puro-sem-separador')).toThrow('Payload criptografado inválido.')
    expect(() => decryptText('aa:bb')).toThrow('Payload criptografado inválido.')
  })
})
