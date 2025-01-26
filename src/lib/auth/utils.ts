'use server'

import bcrypt from 'bcryptjs';

const saltRounds = 10;

export async function hashPassword(pw: string): Promise<string> {
    const pepper = process.env.AUTH_SECRET || '';
    const passwordWithPepper = pw + pepper;
  
    const hashedPassword = await bcrypt.hash(passwordWithPepper, saltRounds);
    return hashedPassword;
}
