// This middleware is used to verify if a user exists or not

import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {

    try {
        // Authorization header format : Bearer <Token>
        // replace method replaces "Bearer " with empty string so that we get the token value 
        const token = req.cookies?.accessToken() || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorised Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
}) 
