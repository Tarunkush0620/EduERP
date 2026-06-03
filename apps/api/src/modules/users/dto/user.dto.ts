import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@eduerp.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secure@123' })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number, and special character' },
  )
  password: string;

  @ApiProperty({ enum: ['teacher', 'student'] })
  @IsEnum(['teacher', 'student'])
  role: 'teacher' | 'student';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ enum: ['active', 'suspended', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'suspended', 'inactive'])
  status?: 'active' | 'suspended' | 'inactive';
}
