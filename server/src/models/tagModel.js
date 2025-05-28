import { model, Schema } from "mongoose";

const tagSchema = new Schema(
  {
    name: {
      required: true,
      type: String
    }
  },
  { collection: "Tag", strict: false }
);

const tagModel = model("Tag", tagSchema);
export { tagModel, tagSchema };
