export interface AuthType {
  id: string;
  email: string;
  name?: string;
  plan?: string;
}

export interface ExternalProjectCreate {
  id: string;
  projectId: string;
  name: string;
  email: string;
  keyType: string;
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
