import UserManager from "../DAO/manager/UserManager.js";
import { Router } from "express";
import { createHash, isValidPassword } from "../utils.js"; //MODIFIQUÉ ACÁ REF.LOGIN
import passport from "passport"; //REF.LOGIN
import GitHubStrategy from "passport-github2"



const userRouter = Router();
const users= new UserManager();

//NOTA PARA DESPUÉS: SERÁ QUE ACÁ DEBO CREAR EL CREATEHASH, PORQUE ABAJO ESTÁ VALIDANDO PERO ACÁ ESTÁ CREANDO 
userRouter.post("/formRegister", passport.authenticate('formRegister',{failureRedirect:'/failformRegister'}), async (req, res) => { 
    //MODIFIQUÉ ACÁ REF.LOGIN
    try {
        console.log("Datos recibidos del formulario:", req.body);
        const newUser = req.body;
        res.send({ status: "success", message: "Usuario registrado" })
        console.log("Nuevo usuario recibido:", newUser);

        newUser.password = createHash(newUser.password); //SE MODIFICÓ ACÁ PARA REF.LOGIN createHash

        const result = await users.addUser(newUser);
        console.log("Resultado de addUser:", result);
        res.redirect("/login");
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).send("Error al registrar el usuario: " + error.message);
    }})

    //____________________________________________________________________________________________________________________________
//     try 
//     {
//         const { first_name, last_name, email, age, password, rol }= req.body
//         if (!first_name || !last_name || !email || !age)  return res.status(400).send({ status: 400, error: 'Faltan datos' })
//         res.redirect("/login")
//     } catch (error) 
//     {
//         res.status(500).send("Error al acceder al registrar: " + error.message);
//     }
// })
    


userRouter.get("/failformRegister",async(req,res)=>{
    console.log("Falló el registro")
    res.send({error: "Error"})
})

userRouter.post("/login", passport.authenticate('login',{failureRedirect:'/faillogin'}), async (req, res) => { //MODIFIQUÉ ACÁ REF.LOGIN
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log("Intento de inicio de sesión con email:", email);

        const authenticatedUser = await users.validateUser(email);
        console.log("Usuario validado:", authenticatedUser);

        // if (authenticatedUser && authenticatedUser.password === password) {
        //if (authenticatedUser && isValidPassword(authenticatedUser, password)) { //MODIFIQUÉ ACÁ REF.LOGIN CON isValidPassword
        if (authenticatedUser && isValidPassword(authenticatedUser.password, password)) {
            console.log("Inicio de sesión exitoso");

            req.session.nomUsuario = authenticatedUser.first_name;
            req.session.edadUsuario = authenticatedUser.age;

            res.redirect("/userProfile");
        } else {
            console.log("Credenciales incorrectas");
            res.redirect("/login?error=auth_failed"); // Redirige de vuelta a la página de inicio de sesión con un mensaje de error
        }
    } catch (error) {

        console.error('Error al iniciar sesión:', error);
        res.status(500).send("Error al iniciar sesión: " + error.message);
    }})
//_______________________________________________________________________________________________________________________________________________
//     try 
//     {
//         if(!req.user) return res.status(400).send({status:"error", error: "Credenciales invalidas"})
        
//         if(req.user.rol === 'admin'){
//             req.session.emailUsuario = req.user.email
//             req.session.nomUsuario = req.user.first_name
//             req.session.apeUsuario = req.user.last_name
//             req.session.rolUsuario = req.user.rol
//             res.redirect("/userProfile")
//         }
//         else{
//             req.session.emailUsuario = req.user.email
//             req.session.rolUsuario = req.user.rol
//             res.redirect("/products")
//         }

//     } 
//     catch (error) 
//     {
//         res.status(500).send("Error al acceder al perfil: " + error.message);
//     }
// });

userRouter.get("/faillogin", (req, res)=>{  //MODIFIQUÉ ACÁ REF.LOGIN
    res.send({error:"login fallido"})
})


userRouter.get("/userProfile", (req, res) => {
    console.log("Acceso a la ruta /userProfile");
    console.log("Valores de sesión:", req.session);

    if (req.session.rolUsuario === 'admin') {
        console.log("Redirigiendo a /login debido a rol de administrador");
        res.redirect("/login");
    } else {
        console.log("Renderizando la vista de perfil");
        res.render("userProfile", {
            title: "Perfil de Usuario",
            first_name: req.session.nomUsuario,
            last_name: req.session.apeUsuario,
            email: req.session.emailUsuario,
            age: req.session.edadUsuario, 
        });
    }
});



userRouter.get("/logout", (req, res) => { //En este caso, "/logout" es una ruta que se utiliza para gestionar el cierre de sesión de un usuario 
    req.session.destroy((error) => {
        if (error) {
            return res.json({ status: 'Cerrar sesión Error', body: error });
        }
        res.redirect('../../login');
    });
});

//-------------------------------------------

userRouter.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => {
    console.log("Iniciando autenticación de GitHub..."); // Agregado para depuración
});

userRouter.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    console.log("Callback de autenticación de GitHub..."); // Agregado para depuración
    console.log("Usuario autenticado:", req.user); // Agregado para depuración
    req.session.user = req.user;
    req.session.emailUsuario = req.session.user.email
    req.session.rolUsuario = req.session.user.rol
    res.redirect("/products")
});


export default userRouter;
