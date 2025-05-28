import { model, Schema } from "mongoose";

const categorySchema = new Schema(
  {
    image: {
      required: false,
      type: String
    },
    name: {
      required: true,
      type: String,
      unique: true
    }
  },
  { collection: "Category", strict: false }
);

const categoryModel = model("Category", categorySchema);
export { categoryModel, categorySchema };
