import { describe, expect, it } from 'vitest'
import { decryptText as decryptFromCryptoModule } from './crypto.js'
import { decryptText, encryptText } from './encryption.js'

describe('lib/encryption', () => {
  it('faz round-trip de texto com acentos e emoji', () => {
    const samples = ['maria@exemplo.com', 'Placa ABC-1234', 'Observação longa ✅ '.repeat(20)]

    for (const sample of samples) {
      expect(decryptText(encryptText(sample))).toBe(sample)
    }
  })

  it('usa IV aleatório e não expõe o texto puro', () => {
    const plain = 'documento-ficticio-12345'
    const first = encryptText(plain)
    const second = encryptText(plain)

    expect(first).not.toBe(second)
    expect(first).not.toContain(plain)
    expect(first.split(':')).toHaveLength(3)
  })

  it('rejeita payload adulterado ou malformado', () => {
    const [iv, authTag, encrypted] = encryptText('segredo').split(':')
    const bytes = Buffer.from(encrypted ?? '', 'hex')
    bytes[0] = (bytes[0] ?? 0) ^ 0xff

    expect(() => decryptText(`${iv}:${authTag}:${bytes.toString('hex')}`)).toThrow()
    expect(() => decryptText('sem-separador')).toThrow('Payload criptografado inválido.')
  })

  it('gera hex e não é intercambiável com lib/crypto (base64)', () => {
    // encryption.ts não tem importadores em src; os services usam crypto.ts.
    // Este teste documenta que os dois formatos não são compatíveis entre si.
    const payload = encryptText('valor')

    expect(payload).toMatch(/^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/)
    expect(() => decryptFromCryptoModule(payload)).toThrow()
  })
})
