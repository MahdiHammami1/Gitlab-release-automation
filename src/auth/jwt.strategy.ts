// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.access_token, // ← lire depuis cookie
            ]),
            secretOrKey: process.env.JWT_SECRET || 'changeme',
            ignoreExpiration: false,
        });
    }

    async validate(payload: any) {
        return {
            id: payload.sub,
            email: payload.email,
            username: payload.username,
        };
    }
}
