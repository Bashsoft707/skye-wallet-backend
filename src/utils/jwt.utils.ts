import { sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const signToken = (id: string) => {
  return sign({ id }, configService.get<string>('JWT_SECRET'), {
    expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
  });
};

export const retrieveTokenValue = async <T>(
  token: string,
): Promise<T & { iat: number }> => {
  return new Promise<T & { iat: number }>((res, rej) =>
    verify(token, process.env.JWT_SECRET, (err, value: unknown) => {
      if (err) return rej(err);
      res(value as T & { iat: number });
    }),
  );
};
