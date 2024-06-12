// prismaUtils.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const saveSubFlow = async (subflowData) => {
  try {
    await prisma.subflow.create({
      data: subflowData,
    });
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data:", error);
    throw error;
  }
};

// You can define other Prisma-related functions here as needed
