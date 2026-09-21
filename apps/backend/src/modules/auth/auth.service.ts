import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.config';
import { jwtConfig } from '../../config/jwt.config';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw { status: 409, message: 'El email ya está registrado' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.password) {
      throw { status: 401, message: 'Credenciales inválidas' };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw { status: 401, message: 'Credenciales inválidas' };
    }

    return this.buildAuthResponse(user);
  }

  async loginWithGoogle(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw { status: 401, message: 'Token de Google inválido' };
    }

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: payload.sub, picture: payload.picture },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload.email,
          googleId: payload.sub,
          picture: payload.picture,
          role: 'USER',
        },
      });
    }

    return this.buildAuthResponse(user);
  }

  async refresh(userId: string, email: string, role: string) {
    const token = jwt.sign(
      { sub: userId, email, role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
    );
    return { token };
  }

  private buildAuthResponse(user: { id: string; email: string; name: string; role: string }) {
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}