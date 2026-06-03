import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { Role, Permission, RolePermissions } from '@eduerp/shared';
import { DATABASE_TOKEN } from '../../database/database.module';
import { Database } from '../../database/database';
import { users, refreshTokens, roles, permissions, rolePermissions } from '../../database/schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Your account has been suspended. Contact administrator.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    // Get permissions for the user's role
    const userPermissions = await this.getUserPermissions(user.role as Role);

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: userPermissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: (this.configService.get<string>('jwt.expiresIn') || '15m') as any,
    });

    const refreshToken = await this.createRefreshToken(user.id);

    this.logger.log(`User logged in: ${user.email} (${user.role})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async refreshAccessToken(token: string) {
    // Find the refresh token
    const [storedToken] = await this.db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.token, token), eq(refreshTokens.revoked, false)))
      .limit(1);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > storedToken.expiresAt) {
      // Revoke expired token
      await this.db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.id, storedToken.id));

      throw new UnauthorizedException('Refresh token has expired. Please login again.');
    }

    // Get user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, storedToken.userId))
      .limit(1);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or account suspended');
    }

    // Revoke old refresh token (rotation)
    await this.db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, storedToken.id));

    // Get permissions
    const userPermissions = await this.getUserPermissions(user.role as Role);

    // Generate new tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: userPermissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: (this.configService.get<string>('jwt.expiresIn') || '15m') as any,
    });

    const newRefreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async logout(refreshToken: string) {
    await this.db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.token, refreshToken));

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        avatar: users.avatar,
        phone: users.phone,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiresAt = new Date();

    // Parse duration string like '7d', '24h', etc.
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      switch (match[2]) {
        case 'd': expiresAt.setDate(expiresAt.getDate() + value); break;
        case 'h': expiresAt.setHours(expiresAt.getHours() + value); break;
        case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + value); break;
        case 's': expiresAt.setSeconds(expiresAt.getSeconds() + value); break;
      }
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7); // default 7 days
    }

    await this.db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  private async getUserPermissions(role: Role): Promise<string[]> {
    // Use the default role permissions from the shared package
    return RolePermissions[role] || [];
  }
}
