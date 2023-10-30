
import GitHubStrategy from "passport-github2"
import { createHash, isValidPassword } from "../utils.js"
import passport from "passport"
import local from "passport-local"
import usersModel from "../DAO/models/user.js"
import { Strategy as localStrategy } from "passport-local";

//para recordar, lo que tengo acá es llamado estrategia 1 y se puede autentificar de manera local 

/*Es importante entender que la utentificación por terceros surge por la ncesiddad de agilizar los procesosa a la hora de registrarse en 
cualquier tipo de aplicación, entonces se crea una aplicación para que se conecte a otras aplicaciones, es el caso de google por ejemplo*/
const initializaPassport = () => {
    // passport.use('formRegister', new local.Strategy({
    //     passReqToCallback: true, usernameField: "email"}, async (req, username, password, done) => {

    //     try {
    //         let user = await usersModel.findOne({ email: username })
    //         if (user) {
    //             console.log("El usuario ya está registrado")
    //             return done(null, false)
    //         }
    //         const newUser = {
    //             first_name,
    //             last_name,
    //             email,
    //             ege,
    //             passport: createHash(password)
    //         }
    //         let result = await usersModel.create(newUser)
    //         return done(null, result)
    //     } catch (error) {
    //         return done("Error al intentar obtener al usuario" + error)
    //     }
    // }
    // ))

    passport.serializeUser((user, done)=>{
        done(null, user.id)
    })

    passport.deserializeUser(async(id,done)=>{
        let user = await userService.findById(id)
        done(null,user)
    })

    // passport.use('login', new localStrategy({usernameField:"email"}, async(username, password, done)=>{
    //     try {
    //         const user = await usersModel.findOne({email:username})
    //         if(!user){
    //             console.log("No se encuentra al usuario o no existe")
    //             return done(null, false)
    //         }
    //         if(!isValidPassword(user, password))
    //             return done(null, false)
    //             return done(null, user)
            
    //     } catch (error) {
    //         return done (error)
            
    //     }
    // }))

    passport.use("guthub", new GitHubStrategy({
        clientID:"Iv1.1cce9042759205e6",
        clientSecret:"a2d0ba463574bdba7a4510457354336ba2d203ab",
        callbackURL:"http://localhost:8080/api/sessions/githubcallback" //se puede poner cualquier url mientras que corresponda al localhost8080 que es el puerto que estamos usando
        
    }, async(accessToken, refreshToken, profile,done)=>{
        try {
            console.log(profile)
            let user = await usersModel.findOne({email:profile.__json.email})
            if(!user){
                let newUser = {
                    first_name: profile.__json.name,
                    last_name: "",
                    ege:20,
                    email:profile.__json.email,
                    password:""
                }

                let result = await usersModel.create(newUser)
                done(null,result)
            }
            else{
                done(null, user)
            }
        } catch (error) {
            return done(error)
        }
    }
    ))
}

export default initializaPassport