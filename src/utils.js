/*este código establece la ruta absoluta del directorio __dirname, se usa import.meta.url para obtener url de este módulo pero es necesario convertir
esa url  en una ruta de archivo y luego obtener el directorio padre de esa ruta para obtener el __dirname*/
import path from 'path'; /*importación del módulo path de node.js, entrega utilidades para trabajar con rutas de archivos y directorios */
import { fileURLToPath } from 'url'; /*Importa la función fileURLToPath del módulo url. Esta función se utiliza para convertir una URL en una ruta de archivo. */

const __filename = fileURLToPath(import.meta.url) /*import.meta.url entrega la URL del módulo actual. fileURLToPath se utiliza para convertir esa URL en una 
ruta de archivo, y esta se va a almacenar en la variable __filename, que es una constante.  __filename contiene la ruta absoluta del archivo actual. */
const __dirname = path.dirname(__filename) /*Utiliza el módulo path para obtener el directorio padre de __filename. La variable __dirname ahora contiene 
la ruta absoluta del directorio actual. */

export  default __dirname //y al final se exporta para que desde otros mod se pueda acceder a esta ruta abs.

//con todo esto puedo decirle al servidor donde encontrar los archivos desde app.js y servirá en todas las partes donde necesite __dirname