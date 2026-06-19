import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterTenantDto {
  @IsString() @IsNotEmpty() venueName!: string;
  @IsString() @IsNotEmpty() adminName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() password!: string;
  @IsString() @IsNotEmpty() tenantSlug!: string;
}

export class RefreshDto {
  @IsString() @IsNotEmpty() refreshToken!: string;
}
