import { PrismaClient } from "@prisma/client"
import { Permissions } from "../libs/constants/permissions"
import { Roles } from "../libs/constants/roles"
import { EUserStatus } from "../src/module/users/domain/enum/user-status.enum"
import { hashPassword } from "../utils/encrypt"

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log("Truncating all tables...")

  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'twitch'
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('_prisma_migrations');
`

  // Disable foreign key constraints temporarily
  await prisma.$executeRaw`SET session_replication_role = 'replica';`

  for (const { table_name } of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table_name}" CASCADE;`)
      console.log(`Truncated table: ${table_name}`)
    } catch (error) {
      console.error(`Failed to truncate table: ${table_name}`, error)
    }
  }

  // Re-enable foreign key constraints
  await prisma.$executeRaw`SET session_replication_role = 'origin';`

  console.log("All tables truncated.")
}

async function main() {
  await resetDatabase()
  console.log("Start seeding ...")

  const roleNames = Object.values(Roles)
  await prisma.role.createMany({
    data: roleNames.map((name) => ({ name })),
    skipDuplicates: true,
  })
  console.log(`Roles seeded: ${roleNames.join(", ")}`)

  const permissionResources = Object.values(Permissions)
  const permissionsToSeed = []

  for (const resource of permissionResources) {
    permissionsToSeed.push(...Object.values(resource))
  }

  await prisma.permission.createMany({
    data: permissionsToSeed.map((name) => ({
      name,
      description: `Permission for ${name.split(".")[1]}`,
    })),
    skipDuplicates: true,
  })
  console.log("Permissions seeded.")

  // 3. Assign permissions to roles
  const rolePermissionsMap = {
    [Roles.User]: [
      Permissions.Users.Read,
      Permissions.Users.Update,
      Permissions.Devices.Read,
      Permissions.LoginHistories.Read,
      Permissions.Followers.Create,
      Permissions.Followers.Delete,
      Permissions.Posts.Create,
      Permissions.Posts.Delete,
      Permissions.Posts.Update,
      Permissions.Posts.Read,
      Permissions.Reactions.Read,
      Permissions.Reactions.Update,
      Permissions.Reactions.Delete,
      Permissions.Reactions.Create,
      Permissions.Friends.Read,
      Permissions.Friends.Create,
      Permissions.Friends.Delete,
      Permissions.Friends.Update,
      Permissions.Followers.Create,
      Permissions.Followers.Delete,
      Permissions.Followers.Update,
      Permissions.Followers.Read,
      Permissions.FriendRequests.Read,
      Permissions.FriendRequests.Create,
      Permissions.FriendRequests.Update,
      Permissions.FriendRequests.Delete,
      Permissions.Groups.Read,
      Permissions.Groups.Update,
      Permissions.Groups.Create,
      Permissions.Groups.Delete,
      Permissions.Categories.Read,
      Permissions.ExternalLinks.Update,
      Permissions.ExternalLinks.Read,
      Permissions.ExternalLinks.Delete,
      Permissions.ExternalLinks.Create,
    ],
    [Roles.Streamer]: [
      Permissions.Users.Read,
      Permissions.Followers.Read,
      Permissions.Categories.Read,
    ],
    [Roles.Admin]: permissionsToSeed,
    [Roles.ServerModerator]: [
      Permissions.Users.Read,
      Permissions.LoginHistories.Read,
      Permissions.Tokens.Read,
    ],
  }

  for (const [roleName, permissions] of Object.entries(rolePermissionsMap)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })

    if (!role) continue

    for (const permissionName of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      })

      const existingRolePermission = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
      })

      if (!existingRolePermission) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        })
      }
    }
    console.log(`Permissions assigned to role: ${roleName}`)
  }

  // 4. Create the default admin user
  const defaultAdmin = await prisma.user.create({
    data: {
      name: "admin1",
      displayName: "Admin",
      slug: "admin",
      email: "nguahoang2003@gmail.com",
      password: await hashPassword("strongPassword123@@AA"), // Replace with hashed password
      phoneNumber: "0123456789",
      dob: new Date("1980-01-01T00:00:00.000Z"), // ISO8601 format
      status: EUserStatus.VERIFIED,
    },
  })
  console.log(`Admin user created: ${defaultAdmin.email}`)

  // 5. Assign 'Admin' role to the default user
  const adminRole = await prisma.role.findUnique({
    where: { name: Roles.Admin },
  })

  if (adminRole) {
    await prisma.userRole.create({
      data: {
        userId: defaultAdmin.id,
        roleId: adminRole.id,
      },
    })
    console.log(`Role '${Roles.Admin}' assigned to user: ${defaultAdmin.email}`)
  }
  // 6. Create the default admin user
  const defaultAdmin2 = await prisma.user.create({
    data: {
      name: "admin2",
      displayName: "Admin 2",
      slug: "admin-2",
      email: "phatvu080903@gmail.com",
      password: await hashPassword("strongPassword123@@AA"), // Replace with hashed password
      phoneNumber: "0123456789",
      dob: new Date("1980-01-01T00:00:00.000Z"), // ISO8601 format
      status: EUserStatus.VERIFIED,
    },
  })
  console.log(`Admin user created: ${defaultAdmin2.email}`)

  // 7. Assign 'Admin' role to the default user
  const adminRole2 = await prisma.role.findUnique({
    where: { name: Roles.Admin },
  })

  if (adminRole2) {
    await prisma.userRole.create({
      data: {
        userId: defaultAdmin2.id,
        roleId: adminRole2.id,
      },
    })
    console.log(
      `Role '${Roles.Admin}' assigned to user: ${defaultAdmin2.email}`,
    )
  }
  // 8. Create a default user with 'User' role
  const defaultUser = await prisma.user.create({
    data: {
      name: "user1",
      displayName: "User",
      slug: "user",
      email: "minhthien2340a@gmail.com",
      password: await hashPassword("regularUserPass123!"),
      phoneNumber: "0987654321",
      dob: new Date("1990-01-01T00:00:00.000Z"),
      status: EUserStatus.VERIFIED,
    },
  })
  console.log(`User created: ${defaultUser.email}`)

  // Assign 'User' role to the default user
  const userRole = await prisma.role.findUnique({
    where: { name: Roles.User },
  })

  if (userRole) {
    await prisma.userRole.create({
      data: {
        userId: defaultUser.id,
        roleId: userRole.id,
      },
    })
    console.log(`Role '${Roles.User}' assigned to user: ${defaultUser.email}`)
  }

  console.log("Seeding completed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect().then(() => console.log("Prisma disconnected."))
  })
