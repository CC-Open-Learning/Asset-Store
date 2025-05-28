import { model, Schema } from "mongoose";

const projectSchema = new Schema(
  {
    description: {
      required: false,
      type: String
    },
    image: {
      required: true,
      type: String
    },
    name: {
      required: true,
      type: String
    }
  },
  { collection: "Project", strict: false }
);

const projectModel = model("Project", projectSchema);
export { projectModel, projectSchema };
