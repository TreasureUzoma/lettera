export interface AuthType {
  id: string;
  email: string;
  name?: string;
}

export type InsertApiKey = {
  projectId: string;
  publicKey: string;
  encryptedSecretKey: string;
  revokedAt?: Date;
};

export type AppBindings = {
  Variables: {
    user: AuthType;
  };
};
