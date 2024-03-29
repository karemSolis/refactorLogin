
import GitHubStrategy from "passport-github2"
import { createHash, isValidPassword } from "../utils.js"
import passport from "passport"
import local from "passport-local"
import UserManager from "../DAO/manager/UserManager.js"

const localStrategy = local.Strategy
const usersManager = new UserManager(); 
//para recordar, lo que tengo acá es llamado estrategia 1 y se puede autentificar de manera local 

/*Es importante entender que la utentificación por terceros surge por la ncesiddad de agilizar los procesosa a la hora de registrarse en 
cualquier tipo de aplicación, entonces se crea una aplicación para que se conecte a otras aplicaciones, es el caso de google por ejemplo*/
const initializaPassport = () => {
    passport.use('formRegister', new localStrategy({passReqToCallback: true, usernameField: "email"}, async (req, username, password, done) => {
        const { first_name, last_name, email, age, rol } = req.body;

        try {
            let user = await usersManager.findEmail({ email: username });

            //if (user !== undefined) {
            if (user) {
                console.log("El usuario ya está registrado");
                return done(null, false);
            }

            const hashedPassword = await createHash(password); // Aquí se hashea la contraseña
            const newUser = { first_name, last_name, email, age, rol, password: hashedPassword };

            const result = await usersManager.addUser(newUser);
            if (result === 'Usuario creado correctamente') {
                // Usuario creado con éxito
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            return done(error);
        }
    }))



    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await usersManager.getUserById(id)
        done(null, user)
    })

    passport.use('login', new localStrategy({ usernameField: "email" }, async (username, password, done) => {

    try {
        const user = await usersManager.findEmail({ email: username });
        if (!user) {
            console.log("No se encuentra al usuario o no existe");
            return done(null, false);
        }
        

        if (!isValidPassword(user, password)) {
            console.log("La contraseña no es válida");
            return done(null, false);
        }
        

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

    passport.use('guthub', new GitHubStrategy({
        clientID:"Iv1.1cce9042759205e6",
        clientSecret:"55cba09e950e60866f15958e3886d68b8f1a9596",
        callbackURL:"http://localhost:8080/api/sessions/githubcallback" //se puede poner cualquier url mientras que corresponda al localhost8080 que es el puerto que estamos usando
        
    }, async(accessToken, refreshToken, profile, done)=>{
        try {
            console.log(profile)
            let user = await usersManager.findEmail({email:profile.__json.email})
            if(!user){
                let newUser = {
                    first_name: profile.__json.name,
                    last_name: "",
                    age:20,
                    email:profile.__json.email,
                    rol: "Usuario",
                    password:"",
          
                }

                let result = await usersManager.addUser(newUser)
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