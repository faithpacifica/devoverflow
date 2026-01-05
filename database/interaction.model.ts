import { Schema, models, model, Types, Document } from "mongoose";

export interface IInteraction {
  user: Types.ObjectId;
  action: string;
  actionId: Types.ObjectId;
  actionType: string;
}

export interface IInteractionDoc extends IInteraction, Document { }
const InteractionSchema = new Schema<IInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // 'upvote', 'downvote', 'view', 'ask_question',
    actionId: { type: Schema.Types.ObjectId, required: true }, // 'questionId', 'answerId',
    actionType: { type: String, enum: ["question", "answer"], required: true },
  },
  { timestamps: true }
);

const Interaction =
  models?.Interaction || model<IInteraction>("Interaction", InteractionSchema);

export default Interaction;

/*Build a Recommendation Engine

By analyzing the user’s interactions, you can suggest content that aligns with their interests. For example:

If a user frequently upvotes answers related to a specific topic, you can recommend similar content
If they've viewed a lot of questions in a particular category, suggest new questions in that category
Personalized Experience

The more you understand user actions, the better you can customize the user experience. Whether it's suggesting trending content or showing recently interacted content, this model helps enhance user engagement.

Data Relationships

It creates an effective connection between users and content (questions or answers). When a user interacts with a piece of content, you need a way to associate this action and track it consistently, whether the user interacts with a question, answer, or both. */