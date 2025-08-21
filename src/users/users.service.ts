// users.service.ts
import {Body, Delete, Get, HttpException, HttpStatus, Injectable, Param, Post} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type  {Prisma,User} from '@prisma/client';
import {CreateUserDto} from "./dto/create-user-dto";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {
    }

    async findAll(): Promise<User[]> {
        try {
            return await this.prisma.user.findMany();
        } catch (error) {
            console.error('Database error:', error);
            throw new HttpException(
                'Failed to retrieve users',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findOne(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id: String(id) } });

    }



    async remove(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }


    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {email}
        });
    }

    async create(data: {
        email: string;
        username: string;
        gitlabId: number;
        accessToken: string;
        refreshToken?: string;
    }) {
        return this.prisma.user.create({
            data: {
                ...data,
                gitlabId: String(data.gitlabId), // conversion explicite en string
            }
        });
    }

    async update(id: string, data: Partial<User>) {
        return this.prisma.user.update({
            where: { id: String(id) },
            data
        });
    }



}