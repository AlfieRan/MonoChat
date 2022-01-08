/*
  Warnings:

  - You are about to drop the column `ChatName` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `ChatsIds` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Description` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `FriendIds` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Nationality` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `chatname` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ispublic` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "ChatName",
DROP COLUMN "isPublic",
ADD COLUMN     "chatname" TEXT NOT NULL,
ADD COLUMN     "ispublic" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "ChatsIds",
DROP COLUMN "Description",
DROP COLUMN "FriendIds",
DROP COLUMN "Nationality",
DROP COLUMN "Password",
DROP COLUMN "name",
ADD COLUMN     "chatids" TEXT[],
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "friendids" TEXT[],
ADD COLUMN     "nationality" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "surname" TEXT NOT NULL;
