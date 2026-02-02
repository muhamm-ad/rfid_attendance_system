// @/data/user.ts

import { prisma } from "@/lib/db";
import { User, UserRole } from "@/types";
import bcrypt from "bcryptjs";

export const createUser = async (user: User) => {
  try {
    const newUser = await prisma.user.create({
      data: user,
    });
    return newUser;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany({
      where: { role },
    });
    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const updateUser = async (user: User) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: user,
    });
    return updatedUser;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    return deletedUser;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const verifyPassword = async (
  user: User,
  password: string,
): Promise<boolean> => {
  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid;
  } catch (error) {
    console.error(error);
    return false;
  }
};
