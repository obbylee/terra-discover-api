/**
 * Hashes a plain text password using Bun's built-in password hashing utility.
 * @param password The plain text password to hash.
 * @returns A Promise that resolves to the hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
  // Bun.password.hash returns a Promise<string>
  return await Bun.password.hash(password);
}

/**
 * Verifies a plain text password against a hashed password using Bun's built-in password verification utility.
 * @param password The plain text password to verify.
 * @param hashedPassword The hashed password to compare against.
 * @returns A Promise that resolves to true if the password matches the hash, false otherwise.
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // Bun.password.verify returns a Promise<boolean>
  return await Bun.password.verify(password, hashedPassword);
}
