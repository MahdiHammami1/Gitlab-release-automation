// src/users/dto/create-user.dto.ts
export class CreateUserDto {
    gitlabId: number;
    email: string;
    username: string;
    accessToken: string;
    refreshToken?: string;
}
