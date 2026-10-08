import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'

/*
 * Contraseñas con scrypt (módulo crypto de Node, sin dependencias).
 * Formato guardado en el Sheet: scrypt$N$r$p$sal$hash (base64url). Nunca se guarda la contraseña.
 */

const N = 16384
const R = 8
const P = 1
const KEYLEN = 32

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEYLEN, { N, r: R, p: P })
  return ['scrypt', N, R, P, salt.toString('base64url'), hash.toString('base64url')].join('$')
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, n, r, p, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !n || !r || !p || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64url')
  const actual = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  })
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

const WORDS = ['filo', 'tapa', 'bravas', 'caña', 'idea', 'logos', 'polis', 'mesa', 'duda', 'verdad', 'razon', 'kant', 'platon', 'hume']

/** Contraseña provisional fácil de dictar, p. ej. "bravas-4821-logos". */
export function provisionalPassword(): string {
  const pick = () => WORDS[randomInt(WORDS.length)]!
  return `${pick()}-${randomInt(1000, 10000)}-${pick()}`
}
