import { IsString, IsUUID, IsEnum, IsOptional, IsDateString, IsNumber, Min, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExamSubjectDto {
  @ApiProperty()
  @IsUUID()
  subjectId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMarks?: number;
}

export class CreateExamDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsUUID()
  classId: string;

  @ApiProperty({ enum: ['unit_test', 'mid_term', 'final', 'practice'] })
  @IsEnum(['unit_test', 'mid_term', 'final', 'practice'])
  examType: 'unit_test' | 'mid_term' | 'final' | 'practice';

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ type: [ExamSubjectDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSubjectDto)
  subjects: ExamSubjectDto[];
}

export class UpdateExamDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['unit_test', 'mid_term', 'final', 'practice'] })
  @IsOptional()
  @IsEnum(['unit_test', 'mid_term', 'final', 'practice'])
  examType?: 'unit_test' | 'mid_term' | 'final' | 'practice';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class StudentResultDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  marksObtained: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class EnterResultsDto {
  @ApiProperty({ type: [StudentResultDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StudentResultDto)
  results: StudentResultDto[];
}
