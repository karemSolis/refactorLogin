import passport from "passport"
import local from "passport-local"
import  { usersModel } from "../models/user.js"
import { createHash, isValidPassword } from "../utils.js"

const initializaPassport = () => {
    passport.use('formRegister', new localStrategy({
        passReqToCallback: true, usernameField: "email"}, async (req, username, password, done) => {

        try {
            let user = await userService.findOne({ email: username })
            if (user) {
                console.log("El usuario ya está registrado")
                return done(null, false)
            }
            const newUser = {
                first_name,
                last_name,
                email,
                ege,
                passport: createHash(password)
            }
            let result = await userService.create(newUser)
            return done(null, result)
        } catch (error) {
            return done("Error al intentar obtener al usuario" + error)
        }
    }
    ))

    passport.serializeUser((user, done)=>{
        done(null, user.id)
    })

    passport.deserializeUser(async(id,done)=>{
        let user = await userService.findById(id)
        done(null,user)
    })

    passport.use('login', new localStrategy({usernameField:"email"}, async(username, password, done)=>{
        try {
            const user = await userService.findOne({email:username})
            if(!user){
                console.log("No se encuentra al usuario o no existe")
                return done(null, false)
            }
            if(!isValidPassword(user, password))
                return done(null, false)
                return done(null, user)
            
        } catch (error) {
            return done (error)
            
        }
    }))
}

export default initializaPassport