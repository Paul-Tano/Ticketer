export interface User extends Document {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  favoriteBands: string[];
  createdAt: Date;
  updateAt: Date;
}
