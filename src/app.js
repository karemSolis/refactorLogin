import express from "express"; //importación de express
import productRouter from "./router/product.routes.js";
import CartRouter from "./router/cart.routes.js";
import { engine } from "express-handlebars"; /*importación de módulo express-handlebars, osea la biblio para usar motores de plantillas handlebars con express */
import * as path from "path" /*importación del módulo path de node.js, entrega utilidades para trabajar con rutas de archivos y directorios */
import __dirname from "./utils.js"; /*importación de la variable __dirname desde el archivo utils.js*/
import ProductManager from "./DAO/manager/ProductManager.js";
import CartManager from "./DAO/manager/CartManager.js";
import mongoose from "mongoose";
import MongoStore from "connect-mongo"
import session from 'express-session'
import FileStore from 'session-file-store'
import userRouter from "./router/users.routes.js";

const app = express(); //aquí la creación de la instancia de la apli express
const httpServer = app.listen(8080, () => console.log("servidor en el puerto 8080")); //definición del puerto http
const fileStorage = FileStore(session)
const product = new ProductManager(); /*esta variable es la copia de product.routes, pero es de ProductManager y
todas sus funcionalidades. averiguar + */
const carts = new CartManager();

//analizarán solicitudes HTTP entrantes y los convertirán en formato json o url
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb+srv://soliskarem:yHO8pYSTC6sFsoi1@coder.9lutzzn.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Conexión a MongoDB Atlas exitosa");
  })
  .catch((error) => {
    console.error("Error de conexión a MongoDB Atlas: ", error);
  });

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: "mongodb+srv://soliskarem:yHO8pYSTC6sFsoi1@coder.9lutzzn.mongodb.net/?retryWrites=true&w=majority",
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    }),
    secret: "ClaveSecretaSeguraYUnicajojojo",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/api/productos", productRouter)
app.use("/api/carritos", CartRouter);
app.use("/api/sessions", userRouter)

//estos middlewars son toda la extructura de handlebars
app.engine("handlebars", engine());  /*acá le digo al servidor que usaremos M.P.handlebars para el uso de express y que será a
través de engine()*/
app.set("view engine", "handlebars"); /*acá le digo al server que los archivos de view terminaran con la extensión .handlebars, se establece la vista
como handlebars, eso significa que express usará handlebars para renderizar las vistas*/
app.set("views", path.resolve(__dirname + "/views")); /*y además obvio debo decirle donde encontrar esos archivos, estableciendo la ubicación de las vistas
es una ruta absoluta al directorio de vistas que utiliza __dirname que he importado desde utils.js, así que express buscará en ese directorio las*/
//middleware para archivos estáticos
app.use("/", express.static(__dirname + "/public")) /*con __dirname le índico que en puclic estarán los archivos estáticos como el 
style.css y realtimeproduct.js dentro de public*/

app.get("/products", async (req, res) => {
  if (req.session.emailUsuario) {
  
    if (req.session.rolUsuario === 'admin') {
      res.redirect("/login");
    } else {
      res.redirect("/userProfile");
    }
  } else {

    let products = await product.getProducts();
    res.render("products", {
      title: "Productos",
      products: products,
      email: req.session.emailUsuario,
      rol: req.session.rolUsuario, 
    });
  }
});

app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const products = await product.getProductById(productId);
  res.render("details", { products });
});

app.get("/carts", async (req, res) => {
  const cart = await carts.readCarts(); 
  const productsInCart = await carts.getProductsForCart(cart.products); 
  console.log("Datos del carrito:", cart);
  res.render("carts", { cart, productsInCart });
});

app.get("/login", (req, res) => {
  // Renderiza la vista de inicio de sesión
  res.render("login", {
    title: "Iniciar Sesión"
  });
});

app.get("/formRegister", (req, res) => {
  // Renderiza la vista de registro
  res.render("formRegister", {
    title: "Registro"
  });
});

app.get("/userProfile", (req, res) => {
  console.log("Valores de sesión:", req.session);
  res.render("userProfile", {
    title: "Perfil de Usuario",
    first_name: req.session.nomUsuario,
    last_name: req.session.apeUsuario,
    email: req.session.emailUsuario,
    rol: req.session.rolUsuario,
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
      if (error) {
          return res.json({ status: 'Cerrar sesión Error', body: error });
      }
      res.redirect('/login'); // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
  });
});








