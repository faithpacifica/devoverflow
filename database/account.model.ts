import { model, models, Schema ,Types} from "mongoose";

export interface IAccount {
  userId: Types.ObjectId; // Reference to the User model
  name: string;
  image?: string;
  password?: string;
  provider: string; //Which service is the user using to log in?
  providerAccountId: string; // The unique identifier from the login provider (e.g., GitHub).
}
export interface IAccountDoc extends IAccount, Document { } // Document interface for Mongoose
const AccountSchema = new Schema<IAccount>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  password: { type: String },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
},{timestamps:true})

const Account = models?.Account || model<IAccount>('Account',AccountSchema)

export default Account;