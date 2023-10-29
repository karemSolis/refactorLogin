import UserManager from "../DAO/manager/UserManager.js";
import { Router } from "express";


const userRouter = Router();
const user = new UserManager();

userRouter.post("/formRegister", async (req, res) => {
    try {
        console.log("Datos recibidos del formulario:", req.body);
        const newUser = req.body;
        console.log("Nuevo usuario recibido:", newUser);
        const result = await user.addUser(newUser);
        console.log("Resultado de addUser:", result);
        res.redirect("/login");
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).send("Error al registrar el usuario: " + error.message);
    }
});

userRouter.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log("Intento de inicio de sesión con email:", email);

        const authenticatedUser = await user.validateUser(email);
        console.log("Usuario validado:", authenticatedUser);

        if (authenticatedUser && authenticatedUser.password === password) {
            console.log("Inicio de sesión exitoso");

            req.session.nomUsuario = authenticatedUser.first_name;
            req.session.edadUsuario = authenticatedUser.age;

            res.redirect("/userProfile"); 
        } else {
            console.log("Credenciales incorrectas");
            res.redirect("/login?error=auth_failed"); // Redirige de vuelta a la página de inicio de sesión con un mensaje de error
        }
    } catch (error) {
        // Manejo de errores
        console.error('Error al iniciar sesión:', error);
        res.status(500).send("Error al iniciar sesión: " + error.message);
    }
});

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

export default userRouter;
