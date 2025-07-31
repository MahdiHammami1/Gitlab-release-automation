// users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {Prisma, User} from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async findOne(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }


    async create(userData: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data: userData });
    }

    async remove(id: number): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
    }
}