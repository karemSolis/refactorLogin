import { Router } from "express";
import passport from "passport"

const sessionsRouter = Router();

sessionsRouter.get("/github", passport.authenticate("github", {scope:["user:email"]}), async(req,res)=>{}) //primer link para lamar desde el front

//segundo link será la dirección final a la ventana de home, para mostrar la información de home (home en mi caso sería products o deberé hacer una nueva vista que home?)
sessionsRouter.get("/githubcallback", passport.authenticate("github", {failureRedirect:"/login"}), async(req, res)=>{
    req.session.user = req.user
    res.redirect("/")
})

export default sessionsRouter