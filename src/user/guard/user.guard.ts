import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { retrieveTokenValue } from 'src/utils/jwt.utils';
import { UserService } from '../user.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    request.user = await this.authorizeUser(context);
    return true;
  }

  async authorizeUser(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split('Bearer')[1].trim();
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    const { id } = await retrieveTokenValue<{ id: string }>(token);

    console.log(id);

    const user = await this.userService.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
