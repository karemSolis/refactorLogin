/*este código establece la ruta absoluta del directorio __dirname, se usa import.meta.url para obtener url de este módulo pero es necesario convertir
esa url  en una ruta de archivo y luego obtener el directorio padre de esa ruta para obtener el __dirname*/
import path from 'path'; /*importación del módulo path de node.js, entrega utilidades para trabajar con rutas de archivos y directorios */
import { fileURLToPath } from 'url'; /*Importa la función fileURLToPath del módulo url. Esta función se utiliza para convertir una URL en una ruta de archivo. */

//----------------------------------//

import bcrypt from 'bcrypt'

/*lo primero es transformar la contraseña o hashar como dice el profe, entonces cuando llamamos a createHash, recibirá como parámetro un password
y va a devover => un bcypt.hashsync que corresponde a un método de la libbrería que hemos instalado y va a agarrar a nuestro password y
codificarlo con bcrypt.genSaltync y 10 correspondería a la solicitud del valor que nos va a dar, IMPORTANTE ES QUE NO PODEMOS USAR IF PARA 
VALIDARLO PORQUE CADA VEZ QUE QUIERA ACCEDER AL PASSWORD EL HASH SE IRÁ MODIFICANDO PARA QUE NO VEA, PERO POR DETRÁS BCRYPT SI SABRÁ LO QUE EXISTE*/
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

/* para validar usamos esta otra función, la cual se llama isvalidpassword y recibe user y password, lo que hará será comparar las dos 
cosas con bcrypt.comparesSync, el password y el user.password*/

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)


//-----------------------------------------------------------------------------------------------------------------------------------------------------------------//

const __filename = fileURLToPath(import.meta.url) /*import.meta.url entrega la URL del módulo actual. fileURLToPath se utiliza para convertir esa URL en una 
ruta de archivo, y esta se va a almacenar en la variable __filename, que es una constante.  __filename contiene la ruta absoluta del archivo actual. */
const __dirname = path.dirname(__filename) /*Utiliza el módulo path para obtener el directorio padre de __filename. La variable __dirname ahora contiene 
la ruta absoluta del directorio actual. */

export default __dirname //y al final se exporta para que desde otros mod se pueda acceder a esta ruta abs.

//con todo esto puedo decirle al servidor donde encontrar los archivos desde app.js y servirá en todas las partes donde necesite __dirname