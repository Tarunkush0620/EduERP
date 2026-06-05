import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { students, teachers, classes, users } from '../../database/schema';
import { count, eq } from 'drizzle-orm';

@Injectable()
export class DashboardService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getAdminDashboard() {
    // Fetch real counts from DB
    const [totalStudents] = await this.db.select({ count: count() }).from(students);
    const [totalTeachers] = await this.db.select({ count: count() }).from(teachers);
    
    return {
      kpis: {
        totalStudents: totalStudents.count,
        totalTeachers: totalTeachers.count,
        attendanceRate: 94.2, // Mock data
        feeCollection: 1850000, // Mock data
        pendingFees: 320000, // Mock data
        newAdmissions: 42, // Mock data
      },
      charts: {
        enrollmentGrowth: [65, 78, 82, 72, 88, 95, 92, 85, 90, 98, 105, 112],
        revenueTrend: [45, 55, 50, 65, 70, 62, 75, 80, 72, 85, 90, 88],
      },
      classPerformance: [
        { name: 'Class 10-A', score: 92, grade: 'A+' },
        { name: 'Class 9-B', score: 88, grade: 'A' },
        { name: 'Class 12-A', score: 85, grade: 'A' },
        { name: 'Class 11-C', score: 79, grade: 'B+' },
        { name: 'Class 8-A', score: 76, grade: 'B' },
      ],
      recentActivity: [
        { title: 'New student enrolled', description: 'Rahul Sharma joined Class 10-A', time: '2 min ago', type: 'success' },
        { title: 'Fee payment received', description: '₹15,000 from Priya Patel (Class 8-B)', time: '15 min ago', type: 'info' },
        { title: 'Attendance alert', description: 'Class 7-C has below 85% attendance today', time: '30 min ago', type: 'warning' },
        { title: 'Exam results published', description: 'Mid-term results for Class 9 are live', time: '1 hour ago', type: 'success' },
        { title: 'Teacher leave request', description: 'Mrs. Gupta requested leave for 2 days', time: '2 hours ago', type: 'info' },
      ],
    };
  }

  async getTeacherDashboard(userId: string) {
    // In future phases: fetch real schedule, submissions, classes
    return {
      summary: {
        classesToday: 5,
        pendingAssignments: 12,
        attendancePending: 2,
        unreadMessages: 6,
      },
      schedule: [
        { time: '9:00 AM', subject: 'Mathematics', class: 'Class 10-A', status: 'completed' },
        { time: '10:00 AM', subject: 'Physics', class: 'Class 11-B', status: 'completed' },
        { time: '11:00 AM', subject: 'Mathematics', class: 'Class 9-A', status: 'ongoing' },
        { time: '1:00 PM', subject: 'Physics', class: 'Class 12-A', status: 'upcoming' },
        { time: '2:00 PM', subject: 'Mathematics', class: 'Class 8-C', status: 'upcoming' },
      ],
      pendingSubmissions: [
        { title: 'Quadratic Equations Worksheet', class: 'Class 10-A', count: 28, deadline: 'Due yesterday' },
        { title: 'Newton\'s Laws Lab Report', class: 'Class 11-B', count: 22, deadline: 'Due today' },
        { title: 'Trigonometry Practice Set', class: 'Class 9-A', count: 30, deadline: 'Due in 2 days' },
      ],
      studentsPerformance: [
        { name: 'Aditya Kumar', attendance: '96%', assignments: '10/10', score: '92%', status: 'Excellent' },
        { name: 'Sneha Patel', attendance: '94%', assignments: '9/10', score: '88%', status: 'Good' },
        { name: 'Rahul Verma', attendance: '78%', assignments: '7/10', score: '65%', status: 'At Risk' },
        { name: 'Priya Singh', attendance: '98%', assignments: '10/10', score: '95%', status: 'Excellent' },
        { name: 'Amit Sharma', attendance: '82%', assignments: '8/10', score: '72%', status: 'Average' },
      ],
    };
  }

  async getStudentDashboard(userId: string) {
    // Find the student ID from user ID
    let rollNo = 'N/A';
    let className = 'N/A';
    
    try {
      const [studentData] = await this.db.select()
        .from(students)
        .where(eq(students.userId, userId))
        .limit(1);
        
      if (studentData) {
        rollNo = studentData.rollNumber;
        
        // Find class name
        const [classData] = await this.db.select()
          .from(classes)
          .where(eq(classes.id, studentData.classId))
          .limit(1);
          
        if (classData) className = classData.name;
      }
    } catch (e) {
      // Ignore if student not found in mock
    }

    return {
      profile: {
        rollNo,
        className,
      },
      overview: {
        attendancePercent: 92,
        gpa: 8.3,
        pendingAssignments: 3,
        upcomingExams: 2,
      },
      timetable: [
        { time: '9:00', subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'R-201', status: 'done' },
        { time: '10:00', subject: 'Physics', teacher: 'Mrs. Gupta', room: 'Lab-3', status: 'done' },
        { time: '11:00', subject: 'Chemistry', teacher: 'Dr. Patel', room: 'Lab-1', status: 'now' },
        { time: '12:00', subject: 'English', teacher: 'Ms. Johnson', room: 'R-105', status: 'next' },
        { time: '1:00', subject: 'Lunch Break', teacher: '', room: '', status: 'break' },
        { time: '2:00', subject: 'Computer Science', teacher: 'Mr. Khan', room: 'CS Lab', status: 'later' },
      ],
      assignments: [
        { title: 'Trigonometry Problem Set', subject: 'Mathematics', deadline: 'Tomorrow', urgent: true },
        { title: 'Lab Report: Acids & Bases', subject: 'Chemistry', deadline: 'In 3 days', urgent: false },
        { title: 'Essay: Climate Change', subject: 'English', deadline: 'In 5 days', urgent: false },
      ],
      results: [
        { exam: 'Unit Test 3', subject: 'Mathematics', marks: '45/50', grade: 'A+', trend: 'up' },
        { exam: 'Unit Test 3', subject: 'Physics', marks: '42/50', grade: 'A', trend: 'up' },
        { exam: 'Unit Test 3', subject: 'Chemistry', marks: '38/50', grade: 'B+', trend: 'down' },
        { exam: 'Unit Test 3', subject: 'English', marks: '44/50', grade: 'A', trend: 'up' },
      ],
      notifications: [
        { title: 'Mid-Term Exam Schedule Released', desc: 'Check your timetable for exam dates', time: '1 hour ago', type: 'info' },
        { title: 'Fee Payment Reminder', desc: 'Q2 fees due by June 15, 2026', time: '3 hours ago', type: 'warning' },
        { title: 'Mathematics Assignment Graded', desc: 'You scored 92/100 — Great work!', time: 'Yesterday', type: 'success' },
      ],
    };
  }

  async getParentDashboard(userId: string) {
    // Parent dashboard mock data. In future, fetch actual children data.
    return {
      overview: {
        totalChildren: 2,
        pendingFees: 45000,
        unreadNotices: 3,
      },
      children: [
        {
          name: 'Aditya Kumar',
          class: 'Class 10-A',
          attendance: '96%',
          nextExam: 'Mathematics (Tomorrow)',
          pendingAssignments: 2,
        },
        {
          name: 'Priya Kumar',
          class: 'Class 8-C',
          attendance: '98%',
          nextExam: 'Science (In 3 days)',
          pendingAssignments: 0,
        }
      ],
      recentNotices: [
        { title: 'Fee Payment Reminder', date: 'Today', type: 'warning' },
        { title: 'Parent-Teacher Meeting', date: 'Next Friday', type: 'info' },
      ]
    };
  }
}
