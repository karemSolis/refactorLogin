import cartModel from '../models/cart.js'; //se importa modelo de carrito
import ProductManager from "./ProductManager.js"; //se importa ProductManager

class CartManager { /*Esta clase manejará todas las operaciones relacionadas con el carrito de compras*/
    constructor() {
        this.productManager = new ProductManager(); /*En el constructor se crea la instancia que se utilizará para realizar operaciones relacionadas con productos, esto quiere decir que creamos la 
    instancia productManager  de ProductManager, esto quiere decir que creamos un objeto que hereda todas las propiedades y métodos  de la clase ProductManager*/
    }

    async readCarts() { //método readCarts lee todos los carritos de la base de datos
        return await cartModel.find(); /* BUSCA Y DEVUELVE TODOS LOS CARRITOS. Acá espera una respuesta de cartModel que es mi modelo de datos (la que me permite 
            interactuar con M.atlas de manera orientada a objetos), find() es un método que proporciona Mongoose para buscar documentos en una colección de la base 
            de datos, en este caso cartModel.find() busca y devuelve todos los documentos en este caso todos los carritos de la colección.*/
    }

    async exist(cartId) { /*El método exist se utiliza para verificar si un carrito específico existe en la base de datos. Recibe un id como parámetro y 
    utiliza el método findById del modelo cartModel para buscar el carrito correspondiente en la base de datos.*/
        return await cartModel.findById(cartId); /*ESPERA UNA RESPUESTA DEL cartModel, QUE EL ID COINCIDA Y QUE DEVUELVA EL PRODUCTO BUSCADO POR ID */
    } /*la función exist(id) se utiliza para comprobar la existencia de un carrito en la base de datos mediante su ID. El parámetro id debe coincidir con el ID de un 
    carrito en la base de datos, y no tiene relación directa con ProductManager o product.routes.js, ya que estás operando en el contexto de carritos en este caso. */


    async addCarts() { /*addCarts es un método que se utiliza para crear un nuevo carrito en la base de datos.*/
        const newCart = await cartModel.create({ products: [] }); /*la constante newCart solo vive dentro del método addCarts, es el resultado de la operacíón cartModel.create({ products: []
            esta representa un nuevo carrito que se crea cuando se realiza esta operación, no está conectada a ninguna otra parte de mi aplicación ni a ninguna instancia global,
            así que newCart solo existe dentro de este contexto de addCarts, así cada vez que se llame a addCard se crea la variable newCart y su proposito es mantener temporalmente
            el carrito recién creado antes del mensaje que devolverá con return "carrito agregado"  */
        return "Carrito Agregado";
    }

    /*Este método se utiliza para obtener un carrito específico de la base de datos según un ID dado, toma de argumento el id que debería ser único del carrito que quiero
    recuperar, llama al método exist(id)para verificar si existe un carrito con ese id en la base de datos, si no se encuentra carrito con ese id devuelve mensaje: "carrito no existe" */
    async getCartsById(cartId) {
        const cart = await this.productManager.exist(cartId);
        if (!cart) return "Carrito no existe";/*esta estructura condicional if VERIFICA si la variable cart es falsy o si no existe, es falsy cuando su valor es null, undefined, false o 0
        si al verificar es falsy retorna un mensaje que dice el carrito no exixte  */
        return cart;/*Si se encuentra el carrito en la base de datos (lo que significa que exist(id) devolvió un carrito válido), entonces se devuelve ese carrito. El carrito se carga de 
        la base de datos y se devuelve para su uso posterior en la aplicación. */
    }


    /*Este método se utiliza para obtener detalles de productos a partir de una lista de IDs de productos.Recibe como argumento productIds, en plural, esto es
    porque busca devolver la lista de todos los carritos */
    async getProductsForCart(productIds) {
        const products = await this.productManager.getProductById(productIds); /*hace referencia a la instancia productManager creada en el constructor arriba, 
        const products = await this.productManager.getProductById(productIds);
        lo que permite acceder a las funcionalidades de ProductManager.js para interactuar con los productos */
        return products; //devuelve products que son lo que queda almacenado en constante products cuando se hace la búsqueda de todos los carritos 
    }

    /*addProductInCart Tiene como propósito agregar un producto a un carrito específico */
    /*Este es el encabezado del método. Indica que el método es asíncrono y toma dos argumentos: cartId y productId. */
    async addProductInCart(cartId, productId) { /*cartId, productId representan id de carrito y id de productos */
        const cart = await this.exist(cartId);
        /*reutilizamos el método exist de arriba usando this.exist, este buscará el carrito en la base de datos usando 
            el id verificando si existe y la devuelve si la encuentra, devuelve el carrito que se almacenará en cart que pasará a ser un objeto almacenado ahi,
             y es con lo que se sigue trabajando en este método  */
        if (!cart) {/*si no lo encuentra devuelve una respuesta de que el carrito no existe */
            console.log("Carrito no existe");
            return "Carrito no existe";
        }
        // BUSCA EL PRODUCTO en la base de datos con el ID especificado (productId).
        const product = await this.productManager.exist(productId);
        // Verifica si el producto no existe en la base de datos.
        if (!product) {
            console.log("No se encuentra el producto");
            return "No se encuentra el producto"; //retorna respuesta 
        }

        // COMPRUEBA si el producto ya está presente en el carrito.
        if (cart.products.some((prod) => prod.id.equals(product._id))) { /* En esta línea, estamos realizando una comprobación para verificar si el producto con el 
        productId proporcionado ya existe en la propiedad products del objeto cart - .some(): Este es un método de array que se utiliza para verificar si al menos 
        un elemento en el array cumple con cierta condición. En este caso, estamos utilizando .some() para iterar a través de los elementos del array products del carrito.*/
            // Si el producto ya está en el carrito, incrementa su cantidad.
            const existingProduct = cart.products.find((prod) => prod.id.equals(productId));
            existingProduct.quantity++;
            await cart.save(); /*await cart.save();: Aquí, se guarda el carrito actualizado en la base de datos. Si el producto ya existía en el carrito (lo cual
                 se verifica en el bloque if anterior), al incrementar la cantidad del producto existente, es necesario guardar el carrito actualizado en la base de datos. */
            console.log("Producto sumado en el carrito");
            cart.products.push({ id: productId, quantity: 1 }); /*cart.products.push({ id: productId, quantity: 1 });: Si el producto no se encontró previamente en el carrito, 
            se agrega un nuevo objeto al array products del carrito. Este objeto contiene dos propiedades: id, que es el identificador único del producto que se está agregando, 
            y quantity, que se establece en 1, indicando que este es el primer ejemplar de ese producto en el carrito. */
            await cart.save(); /* Después de agregar el producto al carrito, se guarda el carrito actualizado nuevamente en la base de datos. */
            console.log("Producto en el carrito :)");
        }
        return "Producto agregado al carrito";
    }



}

export default CartManager;
