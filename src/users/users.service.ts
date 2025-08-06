// users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type  {Prisma,User} from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async findOne(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id: String(id) } });

    }



    async remove(id: number): Promise<void> {
        await this.prisma.user.delete({ where: { id: String(id) } });
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
            data
        });
    }

    async update(id: string, data: Partial<User>) {
        return this.prisma.user.update({
            where: { id: String(id) },
            data
        });
    }



}