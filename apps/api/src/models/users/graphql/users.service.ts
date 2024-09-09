import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { FindManyUserArgs, FindUniqueUserArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { UpdateUserInput } from './dtos/update-user.input'
import {
  LoginInput,
  RegisterWithCredentialsInput,
  RegisterWithProviderInput,
} from './dtos/create-user.input'
import * as bycrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

  async registerWithProvider({
    image,
    name,
    uid,
    type,
  }: RegisterWithProviderInput) {
    try {
      return await this.prisma.user.create({
        data: {
          name,
          uid,
          image,
          AuthProvider: {
            create: { type },
          },
        },
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  async registerWithCredentials({
    image,
    name,
    email,
    password,
  }: RegisterWithCredentialsInput) {
    try {
      const existingUser = await this.prisma.credentials.findUnique({
        where: {
          email,
        },
      })

      if (existingUser) {
        throw new BadRequestException('User already exists')
      }

      //Hash the Password
      const salt = bycrypt.genSaltSync(10)
      const passwordHash = bycrypt.hashSync(password, salt)

      const uid = uuid()

      return await this.prisma.user.create({
        data: {
          uid,
          name,
          image,
          Credentials: {
            create: { email, passwordHash },
          },
          AuthProvider: {
            create: { type: 'CREDENTIALS' },
          },
        },
        include: {
          Credentials: true,
        },
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  async login({ email, password }: LoginInput) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          Credentials: { email }
        },
        include: {
          Credentials: true
        }
      })

      if (!user) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const isPasswordValid = bycrypt.compareSync(password, user.Credentials.passwordHash)

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const jwtToken = this.jwtService.sign(
        { uid: user.uid },
        {
          algorithm: 'HS256',
        }
      )

      return { token: jwtToken }

    } catch (error) {
      throw new Error(error)
    }
  }

  findAll(args: FindManyUserArgs) {
    return this.prisma.user.findMany(args)
  }

  findOne(args: FindUniqueUserArgs) {
    return this.prisma.user.findUnique(args)
  }

  update(updateUserInput: UpdateUserInput) {
    const { uid, ...data } = updateUserInput
    return this.prisma.user.update({
      where: { uid },
      data: data,
    })
  }

  remove(args: FindUniqueUserArgs) {
    return this.prisma.user.delete(args)
  }
}
