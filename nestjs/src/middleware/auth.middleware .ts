import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

/**
 * Extracts the JWT token from the request headers.
 * @param context - The execution context of the request.
 * @returns The JWT token if found, otherwise undefined.
 * @throws UnauthorizedException if the user is not authenticated.
 */
@Injectable()
export class AuthGaurd implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = extractTokenFromRequest(request);
    if (!token) throw new UnauthorizedException();
    try {
      let payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request["user"] = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
    function extractTokenFromRequest(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(" ") ?? [];
      return type === "Bearer" ? token : undefined;
    }
  }
}
