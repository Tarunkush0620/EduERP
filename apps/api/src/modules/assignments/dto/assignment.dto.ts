import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Class ID' })
  @IsUUID()
  classId: string;

  @ApiPropertyOptional({ description: 'Subject ID (optional)' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ description: 'Deadline timestamp' })
  @IsDateString()
  deadline: string;
}

export class UpdateAssignmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class SubmitAssignmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class GradeSubmissionDto {
  @ApiProperty()
  @IsString()
  grade: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}
