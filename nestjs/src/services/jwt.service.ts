import config from '../config';
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtServices {
    constructor(
        private jwtService: JwtService
    ) { }

    /**
     * Creates a new JWT token with the provided payload.
     * @returns {Promise<string>} A promise that resolves to the newly created JWT token.
     */
    async createToken(payload: any) {
        return await this.jwtService.signAsync(payload);
    }

    /**
     * Verifies the validity of a JWT token.
     * @param {string} token - The JWT token to be verified.
     * @returns {Promise<any>} A promise that resolves to the decoded payload if the token is valid.
     * @throws {Error} Throws an error if the token is invalid or expired.
     */
    async verifyToken(token: any) {
        return await this.jwtService.verifyAsync(token, { secret: config.jwtSecret });
    }
}
