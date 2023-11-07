import { usersModel } from "../models/user.js"
import { createHash, isValidPassword } from "../../utils.js";

class UserManager {
    constructor() {
        this.userModel = usersModel;

    }

async addUser(user) {
    try {
      const { first_name, last_name, email, age, rol } = user;
      const password = user.password; // Aquí se obtiene la contraseña
  
      console.log("Intentando agregar nuevo usuario:", user);
      
      const newUser = await this.userModel.create({ first_name, last_name, email, age, rol, password });
      await newUser.save();
      
      console.log("Usuario creado correctamente:", newUser);
      return 'Usuario creado correctamente';
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      return 'Error al crear el usuario';
    }
  }
  
  
  

    //actualiza al usuario que ya existe en la base de datos 
    async updateUser(id, updatedUser) {
        try {
            const userToUpdate = await this.userModel.findById(id);

            if (!userToUpdate) {
                return 'Usuario no encontrado';
            }

            userToUpdate.set(updatedUser);

            await userToUpdate.save();
            console.log("Usuario actualizado correctamente:", userToUpdate);
            return 'Usuario actualizado correctamente';
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            return 'Error al actualizar el usuario';
        }
    }


//obtiene a todos los usuarios 
    async getUsers() {
        try {
            const users = await this.userModel.find({});
            console.log("Usuarios obtenidos:", users);
            return users;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return [];
        }
    }

//obtienen usuario por su id 
    async getUserById(id) {
        try {
            const user = await this.userModel.findById(id).lean();
            
            if (!user) {

                return 'Usuario no encontrado';
            }
            console.log("Usuario obtenido por ID:", user);
            return user;
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
            return 'Error al obtener usuario por ID: ' + error.message;
        }
    }

//borra usuario por su id 
    async deleteUser(id) {
        try {
            const user = await this.userModel.findById(id);

            if (!user) {
                return 'Usuario no encontrado';
            }

            await user.remove();
            console.log("Usuario eliminado correctamente:", user);
            return 'Usuario eliminado correctamente';
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            return 'Error al eliminar el usuario: ' + error.message;
        }
    }

    /*async validateUser(email) {
        
        try {
            console.log("Buscando usuario con email:", email);
            let user;
    
            if (typeof email === 'object') {
                user = await this.userModel.findOne(email); //saqué el const user porq ya había declarado la variable en let user 
                console.log("Usuario encontrado:", user);
            } else if (typeof email === 'string') {
                user = await this.userModel.findOne({ email }); //saqué el const user porq ya había declarado la variable en let user 
                console.log("Usuario encontrado:", user);
            } else {
                throw new Error('Formato de email no válido');
            }
    
            if (!user) {
                return 'No se encuentra usuario';
            }
    
            return user;
        } catch (error) {
            console.error('Error al validar usuario:', error);
            return 'Error al validar usuario: ' + error.message;
        }
    }*/
    async findUser(email) {
        try {
          const user = await this.userModel.findOne({ email }, { email: 1, first_name: 1, last_name: 1, password: 1, rol:1 });
      
          if (!user) {
            return "Usuario no encontrado";
          }
      
          return user;
        } catch (error) {
          console.error('Error al validar usuario', error);
          return 'Error al obtener el usuario';
        }
      }

      async findEmail(param) {
        try {
          const user = await this.userModel.findOne(param)    
          return user
        } catch (error) {
          console.error('Error al validar usuario', error);
          return 'Error al obtener el usuario';
        }
      }
    

}

export default UserManager; 

