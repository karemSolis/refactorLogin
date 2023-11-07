import express from "express"; //importación de express
import { engine } from "express-handlebars"; /*importación de módulo express-handlebars, osea la biblio para usar motores de plantillas handlebars con express */
import mongoose from "mongoose";
import MongoStore from "connect-mongo"
import session from 'express-session'
import FileStore from 'session-file-store'
import passport from "passport";//REF.LOGIN
import * as path from "path" /*importación del módulo path de node.js, entrega utilidades para trabajar con rutas de archivos y directorios */

import ProductManager from "./DAO/manager/ProductManager.js";
import CartManager from "./DAO/manager/CartManager.js";
import UserManager from "./DAO/manager/UserManager.js";

import userRouter from "./router/users.routes.js";
import productRouter from "./router/product.routes.js";
import CartRouter from "./router/cart.routes.js";

import initializaPassport from "./config/passport.config.js";//REF.LOGIN
import __dirname from "./utils.js"; /*importación de la variable __dirname desde el archivo utils.js*/


const app = express(); //aquí la creación de la instancia de la apli express
const httpServer = app.listen(8080, () => console.log("servidor en el puerto 8080")); //definición del puerto http
const fileStorage = FileStore(session)
const product = new ProductManager(); /*esta variable es la copia de product.routes, pero es de ProductManager y
todas sus funcionalidades. averiguar + */
const carts = new CartManager();
const userManager = new UserManager();

//analizarán solicitudes HTTP entrantes y los convertirán en formato json o url
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//ESTABLECE CONEX A LA BASE DE DATOS 
mongoose.connect('mongodb+srv://soliskarem:yHO8pYSTC6sFsoi1@coder.9lutzzn.mongodb.net/?retryWrites=true&w=majority')
  .then(() => {
    console.log("Conexión a MongoDB Atlas exitosa");
  })
  .catch((error) => {
    console.error("Error de conexión a MongoDB Atlas: ", error);
  });


/*LA CONFIGURACIÓN DE SESSION QUE ESTABLECE UNA CONEXIÓN CON ATLAS UTILIZANDO CREDENCIALES, ENTONCES ESTA ES LA PARTE DEL CÓDIGO QUE CONFIGURA
LAS SESIONES DE MI APP USANDO MÓDULO EXPRESS-SESSIONS QUE SE INTALA POR LA TERMINAL Y SE IMPORTA ACÁ*/

/*MIDDLEWARS QUE AGREGA SESIONES, PERMITIENDO QUE LA APP MANTENGA EL ESTADO DE USUARIO ENTRE SOLICITUDAS COMO LA AUTENTICACIÓN 
Y PERCISTENCIA DE LOS DATOS DE LOS USUARIOS */
app.use(session({
    store: MongoStore.create({ /*CONFIGURA EL ALMACENAMIENTO DE SESSIONES USANDO CONNECT-MONGO QUE TB LA INSTALE EN LA TERMINAL, ESTE ALMACENAMIENTO
    ASEGURA QUE SEAN SESIONES PERSISTENTES Y SEGURAS*/
      mongoUrl: "mongodb+srv://soliskarem:yHO8pYSTC6sFsoi1@coder.9lutzzn.mongodb.net/?retryWrites=true&w=majority",
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl : 600
    }),
    secret: "ClaveSecretaSeguraYUnicajojojo", //FIRMA DE LA COOKIE
    resave: false, //EVITA QUE SE GUARDEN LAS SESIONES SIN LOS CAMBIOS QUE PUEDAN TENER 
    saveUninitialized: false, //EVITA QUE LAS SESIONES SE GUARDEN HASTA QUE SE MODIFIQUEN 
    cookie: {//DURACIÓN MÁXIMA 24 HRS
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

//passport.config
(initializaPassport())
app.use(passport.initialize())
app.use(passport.session())


//ENRUTADORES. 
app.use("/api/productos", productRouter) /*ESTABLECE UNA RUTA BASE Y LA ASOCIA CON EL ENRUTADOR PRODUCTROUTER, CUANDO UNA SOLICITUD  LLEGA A UNA RUTA
COMIENZACON /api/productS Y EXPRESS REDIGIRÁ LA SOLICITUD AL ENRUTADOR PARA PROCESARLO.*/
app.use("/api/carritos", CartRouter); /*ESTABLECE UNA RUTA BASE Y REDIRIGE A CARTROUTES*/
app.use("/api/sessions",  userRouter)/*ESTABLECE UNA RUTA BASE Y REDIRIGE A USERROUTES*/

//HANDLEBARS
app.engine("handlebars", engine());  /*acá le digo al servidor que usaremos M.P.handlebars para el uso de express y que será a
través de engine()*/
app.set("view engine", "handlebars"); /*acá le digo al server que los archivos de view terminaran con la extensión .handlebars, se establece la vista
como handlebars, eso significa que express usará handlebars para renderizar las vistas*/
app.set("views", path.resolve(__dirname + "/views")); /*y además obvio debo decirle donde encontrar esos archivos, estableciendo la ubicación de las vistas
es una ruta absoluta al directorio de vistas que utiliza __dirname que he importado desde utils.js, así que express buscará en ese directorio las*/
//middleware para archivos estáticos

//css
app.use("/", express.static(__dirname + "/public")) /*con __dirname le índico que en puclic estarán los archivos estáticos como el 
style.css y realtimeproduct.js dentro de public*/

//---------------------------------------------------------------------------------------------------------------------//

/*DEFINICIÓN DE RUTAS DE MI APP Y ESPECIFICACIÓN DE RESPUESTAS A LAS SOLICITUDES HTTP EN CADA RUTA */
app.get("/products", async (req, res) => { /*RESPONDE A UNA SOLICITUD GET EN LA URL /PRODUCTS. /IMPORTANTE RECORDAD QUE REQ Y RES SON OBJETOS
ESTAS SE USAN PARA MANEJAR SOLICITUDES Y RESPUESTAS HTTP: REQ (REQUEST)-REPRESENTA LA SOLICITUD Y RES(RESPONSE)-REPRESENTA LA RESPUESTA A
DICHA SOLICITUD.Cuando un cliente (como un navegador) envía una solicitud GET a la URL "/products", esta ruta se activará y el controlador 
que sigue a continuación se ejecutará para manejar la solicitud.*/
  if (req.session.emailUsuario) { /*Esta parte del código verifica si existe una sesión activa para el usuario. El objeto req representa la 
  solicitud http entrante y contien información, incluida la sessión del usuario si existe, así q si req.session.emailUsuario es verdadero
  el usuario tiene una sessión activada, osea está registrado :P*/
  res.redirect("/login");

    let products = await product.getProducts(); /*En esta línea se obtienen los productos utilizando la función getProducts del objeto products*/
    res.render("products", { /*Se renderiza la vista products y se envía al cliente como respuesta, esta se compone de un objeto que contiene 
    información que se utilizara en la vista y se muestra a los usuarios*/
      title: "Productos",
      products: products,
      email: req.session.emailUsuario,
      rol: req.session.rolUsuario, 
    });
  }
});

//-----------------------------------------------------------------

app.get("/products/:id", async (req, res) => { 
  const productId = req.params.id;
  const products = await product.getProductById(productId);
  res.render("details", { products });
});

//-----------------------------------------------------------------

app.get("/carts", async (req, res) => {
  const cart = await carts.readCarts(); 
  const productsInCart = await carts.getProductsForCart(cart.products); 
  console.log("Datos del carrito:", cart);
  res.render("carts", { cart, productsInCart });
});
//RECORDAR INTEGRAR EL TEMA DE ID A ESTE MIDDLEWARS
//-----------------------------------------------------------------

app.get("/login", (req, res) => {
  // Renderiza la vista de inicio de sesión
  res.render("login", {
    title: "Iniciar Sesión"
  });
});
//-----------------------------------------------------------------

app.get('/faillogin', (req, res) => {
  res.send('Autenticación fallida. Por favor, verifica tus credenciales.');
});


//-----------------------------------------------------------------

app.get("/formRegister", (req, res) => {
  // Renderiza la vista de registro
  res.render("formRegister", {
    title: "Registro"
    
  });
});

//--------------------------------------------------------------------


app.get('/failformRegister', (req, res) => {
  res.status(400).send('Error en el registro. El usuario ya está registrado.');
});


//------------------------------------------------------------------
/*
app.get("/userProfile", (req, res) => {
  console.log("Valores de sesión:", req.session);
  res.render("userProfile", {
    title: "Perfil de Usuario",
    first_name: req.session.nomUsuario,
    last_name: req.session.apeUsuario,
    email: req.session.emailUsuario,
    rol: req.session.rolUsuario,
  });
});*/
app.get("/userProfile", async (req, res) => { 
  if (!req.session.emailUsuario) 
  {
      return res.redirect("/login")
  }
  res.render("userProfile", {
      title: "Vista Profile Admin",
      first_name: req.session.nomUsuario,
      last_name: req.session.apeUsuario,
      email: req.session.emailUsuario,
      rol: req.session.rolUsuario,

  });
})

//-------------------------------------------------------------------

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
      if (error) {
          return res.json({ status: 'Cerrar sesión Error', body: error });
      }
      res.redirect('/login'); // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
  });
});








