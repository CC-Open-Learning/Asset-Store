import type { Types } from "mongoose";

export interface Session {
  _id?: string;

  createdAt?: Date;
  orgId?: string;

  ownerId?: string;
  persistent?: boolean;
  projectId: string;

  scope: string;
  shareCode?: string;
  teamId?: string;

  token?: string;
  updatedAt?: Date;
}

export interface SessionUser {
  projectId: string;
  shareCode: string;
  token?: string;
  userId: string;
}

export interface User {
  _id: string;
  email?: string;
  googleId?: string;
  picture?: string;
  role: string;
  token?: string;
  username: string;
}

export interface Project {
  _id: string | Types.ObjectId;
  createdAt?: Date;
  description?: string;
  image: string;
  name: string;
  updatedAt?: Date;
}

export interface Tag {
  _id: Types.ObjectId;
  name: string;
}

export interface Category {
  _id: Types.ObjectId;
  image?: string;
  name: string;
}
export interface Model {
  animationCount: number;
  edges: number;
  lodCount: number;
  polygons: number;
  rigType: string;
  textureCount: number;
  triCount: number;
  vertices: number;
}

export interface Texture {
  height: number;
  type: string;
  width: number;
}

export interface Production {
  glb?: string;
  type?: string;
}

export interface Asset {
  _id?: Types.ObjectId;
  categories?: Category[] | Types.ObjectId[];
  createdAt: Date;
  description?: string;
  fileName: string;
  fileSize: number;
  format: string;
  license?: string;
  model?: Model;
  name: string;
  origin?: string;
  previews?: string[];
  price?: number;
  production?: Production;
  projects?: Project[] | Types.ObjectId[];
  tags?: Tag[];
  texture?: Texture;
  updatedAt: Date;
}

export interface UploadObj {
  categories: string[];
  description?: string;
  fileName: string;
  fileSize: number;
  format: string;
  model?: Model;
  name: string;
  production?: Production;
  projects?: string[];
  tags?: string[];
  texture?: Texture;
}

export interface ImageUpload {
  filename: string;
  image: File;
}

export interface ProjectUpload {
  description?: string;
  imageFileName: string;
  name: string;
}

export type SearchContextType = {
  searchSubmission: {
    categories: string[];
    keyword: string;
    projects: string[];
  };
  updateSearchSubmission: (submission: {
    categories: string[];
    keyword: string;
    projects: string[];
  }) => void;
};

export type UploadSubmissionContextType = {
  successfullySubmitted: boolean;
  updateSuccessfullySubmitted: (submission: boolean) => void;
};

export type ProjectContextType = {
  projects: Project[];
  updateProjects: (newList: Project[]) => void;
};

export interface Filter {
  id: string;
  name?: string;
}
