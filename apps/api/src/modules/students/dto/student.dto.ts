import { IsNotEmpty, IsOptional, IsString, IsEmail, MinLength, Matches, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  // User Profile
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'rahul@eduerp.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Student@123' })
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

  // Student Profile
  @ApiProperty({ example: 'STU2025001' })
  @IsString()
  @IsNotEmpty()
  rollNumber: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiProperty({ example: '2025-06-01' })
  @IsDateString()
  @IsNotEmpty()
  admissionDate: string;

  @ApiPropertyOptional({ example: 'Raj Sharma' })
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiPropertyOptional({ example: 'raj@example.com' })
  @IsOptional()
  @IsEmail()
  parentEmail?: string;
}

export class UpdateStudentDto {
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
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  parentEmail?: string;
}
