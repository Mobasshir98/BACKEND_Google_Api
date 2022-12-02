import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { User } from "../models/User.js";

export const connectPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URI,
        passReqToCallback: true,
      },
      async (req,accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value
        const user = await User.findOne({
          email,
        });
        if (req.user) {
          if (req.user.email !== email) {
            if (
              user &&
              req.user.otherAccounts.find((obj) => user._id === obj.userId)
            ) {
                // console.log("1")
              return done(null, user);
            } else {
              const newUser = await User.create({
                email,
                googleId: profile.id,
                name: profile.displayName,
                accessToken:accessToken,
                photo: profile.photos[0].value,
                spreadSheets:req.user.spreadSheets,
                otherAccounts: [
                  ...req.user.otherAccounts,
                  {
                    userId: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    accessToken: req.user.accessToken,
                    // spreadSheets:req.user.spreadSheets
                  },
                ],
              });
              req.user.otherAccounts.forEach(async (otherAccount) => {
                await User.findOneAndUpdate(
                  { _id: otherAccount.userId },
                  {
                    $push: {
                      otherAccounts: {
                        userId: newUser._id,
                        email: newUser.email,
                        name: newUser.name,
                        accessToken:newUser.accessToken,
                        // spreadSheets:newUser.spreadSheets
                      },
                    },
                  }
                );
              });
              const existingUser = await User.findOne({ _id: req.user._id });
              existingUser.otherAccounts.push({
                userId: newUser._id,
                email: newUser.email,
                name: newUser.name,
                accessToken:newUser.accessToken,
                // spreadSheets:newUser.spreadSheets
              });
              await existingUser.save();
              // console.log("2")

              return done(null,newUser)
            }
          }
          else{
            // console.log("3")

            return done(null,req.user)
          }
        }else{
            if(user){
                // console.log("4")

                return done(null,user)
            }
            const newUser = await User.create({
                email,
                googleId: profile.id,
                name: profile.displayName,
                accessToken:accessToken,
                photo: profile.photos[0].value,
                spreadSheets:[],
                otherAccounts:[]
            })
            // console.log("5")
            return done(null,newUser)
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
