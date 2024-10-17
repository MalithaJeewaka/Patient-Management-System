"use server";
import { ID, Query } from "node-appwrite";
import {
  BUCKET_ID,
  databases,
  PATIENT_COLLECTION_ID,
  storage,
  users,
  DATABASE_ID,
  ENDPOINT,
  PROJECT_ID,
} from "../appwrite.config";
import { parseStringify } from "../utils";

import { InputFile } from "node-appwrite/file";

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

export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

//always get the files and other special types seperately
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    // this is how we use appwrite storage to upload files ////////////
    let file;

    // here we should extract the blob file to send it to storage
    if (identificationDocument) {
      const inputFile = InputFile.fromBuffer(
        identificationDocument?.get("blobFile") as Blob,
        identificationDocument?.get("fileName") as string
      );

      //        In TypeScript, the ! operator is called the non-null assertion operator. It tells the TypeScript compiler that the value cannot be null or undefined, even if the type definitions suggest that it might be. When you use ! after BUCKET_ID!, you're essentially telling TypeScript:

      // "I know this value might be null or undefined based on the type, but I am sure it will have a valid value at runtime."

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/bucket/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient,
      }
    );

    return parseStringify(newPatient);

    //////////////////////////////////
  } catch (error) {
    console.log(error);
  }
};
