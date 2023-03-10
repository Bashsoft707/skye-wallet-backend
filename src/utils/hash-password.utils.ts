import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export const hashPassword = async (password: string) => {
  const salt = randomBytes(8).toString('hex');

  const hash = (await scrypt(password, salt, 32)) as Buffer;
  const hashedPassword = salt + '.' + hash.toString('hex');

  return hashedPassword;
};

export const checkPassword = async (
  enteredPassword: string,
  userPassword: string,
) => {
  const [salt, storedHash] = userPassword.split('.');

  const hash = (await scrypt(enteredPassword, salt, 32)) as Buffer;

  if (storedHash !== hash.toString('hex')) {
    return false;
  }

  return true;
};
