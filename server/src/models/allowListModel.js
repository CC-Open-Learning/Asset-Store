import { model, Schema } from "mongoose";

const allowListSchema = new Schema(
  {
    email: {
      required: true,
      type: String
    }
  },
  { collection: "AllowList", strict: false }
);

const allowListModel = model("AllowList", allowListSchema);
export { allowListModel, allowListSchema };
