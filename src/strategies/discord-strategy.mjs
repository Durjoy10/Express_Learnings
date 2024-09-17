import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { DiscordUser } from "../mongoose/schemas/discord-user.mjs";

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await DiscordUser.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


export default passport.use(
    new DiscordStrategy(
        {
            clientID: '1284836725339983924',
            clientSecret: 'V3AffZfgBHbr0EYQ32GCd-jxmURFd0F4',
            callbackURL: 'http://localhost:3000/api/auth/discord/redirect',
            scope: ["identify", "guilds"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await DiscordUser.findOne({ discordId: profile.id });
                if (!user) {
                    user = new DiscordUser({
                        userName: profile.username,
                        discordId: profile.id,
                    });
                    await user.save();
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

