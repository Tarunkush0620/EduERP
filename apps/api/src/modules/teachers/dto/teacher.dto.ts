import { IsNotEmpty, IsOptional, IsString, IsEmail, MinLength, Matches, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  // User Profile
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jane@eduerp.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Teacher@123' })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number, and special character' },
  )
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  // Teacher Profile
  @ApiProperty({ example: 'EMP1001' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiPropertyOptional({ example: 'Science' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'M.Sc. Physics, B.Ed.' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiProperty({ example: '2023-06-01' })
  @IsDateString()
  @IsNotEmpty()
  joiningDate: string;
}

export class UpdateTeacherDto {
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
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qualification?: string;
}
