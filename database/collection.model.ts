import { Schema, models, model, Types, Document } from "mongoose";
// need to store:
// -The user who saved the question: This connects the bookmark to a specific user
//-The question they saved: This is the actual content being saved
export interface ICollection {
  author: Types.ObjectId;
  question: Types.ObjectId;
}

/*-author (User ID): This should be an ObjectId referencing the User model
-question (Question ID): This should also be an ObjectId referencing the Question model
By using ObjectId, each saved item in a collection is linked to its corresponding user and question document, making data retrieval seamless.*/
export interface ICollectionDoc extends ICollection, Document { }
const CollectionSchema = new Schema<ICollection>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  },
  { timestamps: true }
);

const Collection =
  models?.Collection || model<ICollection>("Collection", CollectionSchema);

export default Collection;