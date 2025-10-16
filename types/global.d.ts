import type mongoose from "mongoose"

declare global {
  var mongooseConn: {
    conn: mongoose.Mongoose | null
    promise: Promise<mongoose.Mongoose> | null
  }
}
