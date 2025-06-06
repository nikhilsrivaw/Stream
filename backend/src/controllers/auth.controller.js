import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken"


export async function signup(req, res) {
    const { email, fullName, password } = req.body;

    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'All Fields Are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters" })
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json(400).json({ message: "Enmail already exists , please use a diffrent email" })
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        });
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",

            });
            console.log(`Stream user Created`);
        } catch (error) {
            console.log("error creating Stream User")

        }



        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            scure: process.env.NODE_ENV === "production"
        })

        res.status(201).json({
            success: true, User: newUser
        })
    } catch (error) {
        console.log("error")
        res.status(500).json({ message: "Internal error" })

    }
}
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or passwod" })

        const isPasswordCorrect = await user.matchPassword(password)
        if (!isPasswordCorrect) return res.status(401)({ message: "INVALID EMAIL OR PASSWORD " });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            scure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({ succes: true, user })


    } catch (error) {
        console.log("internal server error")
        res.status(500).json({ message: "Internal Server Error" })

    }
}
export function logout(req, res) {
    res.clearCookie("jwt")
    res.status(200).json({ succes: true, message: "LOgout sucessful" })
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}