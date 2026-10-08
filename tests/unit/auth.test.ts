import { describe, expect, it } from 'vitest'
import { hashPassword, provisionalPassword, verifyPassword } from '@/lib/auth/password'
import { createToken, readToken } from '@/lib/auth/token'

const SECRET = 'x'.repeat(40)

describe('contraseñas', () => {
  it('verifica la buena y rechaza la mala', () => {
    const hash = hashPassword('filoytapas')
    expect(hash.startsWith('scrypt$')).toBe(true)
    expect(verifyPassword('filoytapas', hash)).toBe(true)
    expect(verifyPassword('otra', hash)).toBe(false)
    expect(verifyPassword('filoytapas', 'basura')).toBe(false)
  })

  it('genera provisionales legibles', () => {
    expect(provisionalPassword()).toMatch(/^[a-zñ]+-\d{4}-[a-zñ]+$/)
  })
})

describe('sesión firmada', () => {
  it('lee un token válido', () => {
    expect(readToken(createToken('alba', 2, SECRET), SECRET)).toMatchObject({ u: 'alba', v: 2 })
  })

  it('rechaza tokens manipulados, de otro secreto o caducados', () => {
    const token = createToken('alba', 1, SECRET)
    const [, sig] = token.split('.')
    const forged = `${Buffer.from(JSON.stringify({ u: 'martina', v: 1, e: Date.now() + 1e9 })).toString('base64url')}.${sig}`
    expect(readToken(forged, SECRET)).toBeNull()
    expect(readToken(token, 'y'.repeat(40))).toBeNull()
    expect(readToken(createToken('alba', 1, SECRET, 0), SECRET)).toBeNull()
    expect(readToken(undefined, SECRET)).toBeNull()
  })
})
