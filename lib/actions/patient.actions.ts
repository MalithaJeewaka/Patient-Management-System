"use server";
import { ID, Query } from "node-appwrite";
import { users } from "../appwrite.config";
import { parseStringify } from "../utils";

export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );
    // appwrite document has this
    return newUser;
  } catch (error: any) {
    if (error && error?.code === 409) {
      const documents = await users.list([Query.equal("email", [user.email])]);

      return documents?.users[0];

      //    why use ?

      // Avoiding Runtime Errors: If you try to access a property on undefined or null, JavaScript will throw a TypeError. Using ?. prevents this by safely returning undefined if any part of the chain is undefined or null.

      //error?.code: This is used to check if error is not null or undefined, and if so, to safely access its code property. If error is null or undefined, error?.code will return undefined instead of throwing an error.

      //       When to Use ?.:
      // When you're unsure if an object or property might be null or undefined.
      // When accessing properties of an object that might not exist in all cases.
      // To avoid excessive if checks for null or undefined values.
    }
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.log(error);
  }
};
