import { model, Schema } from "mongoose";
const { ObjectId } = Schema.Types;

const modelSchema = Schema(
  {
    animationCount: Number,
    edges: Number,
    lodCount: Number,
    polygons: Number,
    rigType: String,
    textureCount: Number,
    triCount: Number,
    vertices: Number
  },
  { _id: false }
);

const textureSchema = Schema(
  {
    height: Number,
    type: String,
    width: Number
  },
  { _id: false }
);

const productionSchema = Schema(
  {
    glb: {
      required: false,
      type: String
    },
    type: {
      required: false,
      type: String
    }
  },
  { _id: false }
);

const assetSchema = new Schema(
  {
    categories: {
      ref: "Category",
      required: true,
      type: [ObjectId]
    },
    description: {
      required: false,
      type: String
    },
    fileName: {
      required: true,
      type: String
    },
    fileSize: {
      required: true,
      type: Number
    },
    format: {
      required: true,
      type: String
    },
    license: {
      required: false,
      type: String
    },
    model: {
      required: false,
      type: modelSchema
    },
    name: {
      required: true,
      type: String
    },
    origin: {
      required: false,
      type: String
    },
    previews: {
      required: false,
      type: [String]
    },
    price: {
      required: false,
      type: Number
    },
    production: {
      required: false,
      type: productionSchema
    },
    projects: {
      ref: "Project",
      required: false,
      type: [ObjectId]
    },
    tags: {
      ref: "Tag",
      required: false,
      type: [ObjectId]
    },
    texture: {
      required: false,
      type: textureSchema
    }
  },
  { collection: "Asset", strict: false, timestamps: true }
);

const assetModel = model("Asset", assetSchema);
export { assetModel, assetSchema };
