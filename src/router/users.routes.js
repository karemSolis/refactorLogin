import UserManager from "../DAO/manager/UserManager.js";
import { Router } from "express";
import { createHash, isValidPassword } from "../utils.js"; //MODIFIQUÉ ACÁ REF.LOGIN
import passport from "passport"; //REF.LOGIN
import GitHubStrategy from "passport-github2"



const userRouter = Router();
const users= new UserManager();


userRouter.post("/formRegister", passport.authenticate('formRegister',{failureRedirect:'/login'}), async (req, res) => { 
    try 
    {
        const { first_name, last_name, email, age, password, rol }= req.body
        if (!first_name || !last_name || !email || !age)  return res.status(400).send({ status: 400, error: 'Faltan datos' })
        res.redirect("/login")
    } catch (error) 
    {
        res.status(500).send("Error al acceder al registrar: " + error.message);
    }
})


userRouter.get("/failformRegister",async(req,res)=>{
    console.log("Falló el registro")
    res.send({error: "Error"})
})


userRouter.post("/login", passport.authenticate('login',{failureRedirect:'/faillogin'}), async (req, res) => { //MODIFIQUÉ ACÁ REF.LOGIN
    try 
     {
        if(!req.user) return res.status(400).send({status:"error", error: "Credenciales no validas"})
        
        if(req.user.rol === 'admin'){
            req.session.emailUsuario = req.user.email
            req.session.nomUsuario = req.user.first_name
            req.session.apeUsuario = req.user.last_name
            req.session.rolUsuario = req.user.rol
            res.redirect("/userProfile")
        }
        else{
            req.session.emailUsuario = req.user.email           
            req.session.rolUsuario = req.user.rol
            res.redirect("/products")
        }

    } 
    catch (error) 
    {
        res.status(500).send("Error al acceder al perfil: " + error.message);
    }
});



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
            rol: req.session.rolUsuario
 
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
