import { IsString, IsUUID, IsEnum, IsOptional, IsDateString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentAttendanceEntry {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ enum: ['present', 'absent', 'late', 'excused'] })
  @IsEnum(['present', 'absent', 'late', 'excused'])
  status: 'present' | 'absent' | 'late' | 'excused';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class MarkAttendanceDto {
  @ApiProperty({ description: 'Class ID' })
  @IsUUID()
  classId: string;

  @ApiPropertyOptional({ description: 'Subject ID (optional)' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [StudentAttendanceEntry], description: 'Attendance entries for each student' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceEntry)
  entries: StudentAttendanceEntry[];
}

export class UpdateAttendanceDto {
  @ApiProperty({ enum: ['present', 'absent', 'late', 'excused'] })
  @IsEnum(['present', 'absent', 'late', 'excused'])
  status: 'present' | 'absent' | 'late' | 'excused';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class AttendanceQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Start date YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
