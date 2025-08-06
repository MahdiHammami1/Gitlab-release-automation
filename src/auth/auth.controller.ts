import { Controller, Get, Injectable, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';
import {CreateUserDto} from "../users/dto/create-user-dto";
import {UseGuards} from "@nestjs/common"
import {JwtAuthGuard} from "./jwt-auth.guard";
import { Request } from 'express';
import {UsersService} from "../users/users.service";



interface RequestWithUser extends Request {
    user?: any;
}

@Injectable()
export class UserService {
    async findByEmail(email: string) {
        // requête dans la base pour chercher un user
    }

    async create(data: CreateUserDto) {
        // création du user dans la base
    }
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UsersService,
    ) {}

    private readonly keycloakConfig = {
        clientId: 'backend-client',
        clientSecret: 'OdvqmAx8zR9IpJlOPWaiycgUAFW6Qc1Z',
        realm: 'myrealm',
        redirectUri: 'http://localhost:3000/auth/callback',
        keycloakBaseUrl: 'http://localhost:8080'
    };

    @Get('login')
    login(@Res() res: Response) {
        const { clientId, redirectUri, realm, keycloakBaseUrl } = this.keycloakConfig;

        const authUrl = `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid`;

        return res.redirect(authUrl);
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        const { clientId, clientSecret, redirectUri, realm, keycloakBaseUrl } = this.keycloakConfig;

        if (!code) {
            return res.redirect('http://localhost:4200/login?error=missing_code');
        }

        try {
            // 1. Échange du code contre un access token
            const tokenResponse = await axios.post(
                `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`,
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const { access_token, refresh_token } = tokenResponse.data;

            // 2. Récupération des infos utilisateur
            const userInfoResponse = await axios.get(
                `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            );

            const user = userInfoResponse.data;

            // 3. Enregistrement ou mise à jour de l'utilisateur
            const existingUser = await this.userService.findByEmail(user.email);

            if (!existingUser) {
                await this.userService.create({
                    email: user.email,
                    username: user.preferred_username ?? user.email,
                    gitlabId: parseInt(user.sub), // souvent l’ID GitLab est dans `sub`
                    accessToken: access_token,
                    refreshToken: refresh_token
                });
            } else {
                // (Optionnel) mettre à jour les tokens si l’utilisateur existe déjà
                await this.userService.update(String(existingUser.id), {
                    accessToken: access_token,
                    refreshToken: refresh_token
                });
            }

            // 4. Création d’un cookie sécurisé (HttpOnly)
            res.cookie('access_token', access_token, {
                httpOnly: true,
                secure: false, // ← true en production avec HTTPS
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 jour
            });

            // 5. Redirection vers le frontend
            return res.redirect('http://localhost:4200/dashboard');

        } catch (err) {
            console.error('❌ Erreur OAuth2:', err);
            return res.redirect(`http://localhost:4200/login?error=oauth2_failed`);
        }
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: RequestWithUser) {
        console.log('req.user =', req.user); // 🕵️‍♂️ voir ce que Passport met réellement ici
        return req.user;
    }





}
