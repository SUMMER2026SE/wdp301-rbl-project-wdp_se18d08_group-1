const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { User } = require("../models/User");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          const jwt = require("jsonwebtoken");
          const JWT_SECRET = process.env.JWT_SECRET || "cinema_secret";
          const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

          const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
          );

          return done(null, { user, token });
        }

        // Check if user exists with this email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          user.authProvider = "google";
          // Google email already verified by Google
          if (!user.isVerified) user.isVerified = true;
          await user.save();

          const jwt = require("jsonwebtoken");
          const JWT_SECRET = process.env.JWT_SECRET || "cinema_secret";
          const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

          const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
          );

          return done(null, { user, token });
        }

        // Create new user — không lấy ảnh Google, để null
        user = await User.create({
          email: profile.emails[0].value,
          fullName: profile.displayName,
          googleId: profile.id,
          avatar: null,
          authProvider: "google",
          password: null, // No password for OAuth users
          isVerified: true, // Google already verified the email
        });

        const jwt = require("jsonwebtoken");
        const JWT_SECRET = process.env.JWT_SECRET || "cinema_secret";
        const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRE }
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((data, done) => {
  done(null, data);
});

// Deserialize user from session
passport.deserializeUser((data, done) => {
  done(null, data);
});

module.exports = passport;
