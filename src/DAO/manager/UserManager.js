import { usersModel } from "../models/user.js"
import { createHash, isValidPassword } from "../../utils.js";

class UserManager {
    constructor() {
        this.userModel = usersModel;

    }

    async addUser(user) {
        try {
            console.log("Intentando agregar nuevo usuario:", user);
            const newUser = new this.userMode.create(user);
            await newUser.save();
            console.log("Usuario creado correctamente:", newUser);
            return 'Usuario creado correctamente';
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            return 'Error al crear el usuario';
        }
    }


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


    async validateUser(email) {
        try {
            console.log("Buscando usuario con email:", email);
            const user = await this.userModel.findOne({ email });
            console.log("Usuario encontrado:", user);

            if (!user) {
                return 'Usuario no encontrado';
            }

            return user;
        } catch (error) {
            console.error('Error al validar usuario:', error);
            return 'Error al validar usuario: ' + error.message;
        }
    }

//-------------------------------------------

    // async isValidPassword (password, hashedPassword) {
    //     try {
    //         return await bcrypt.compare(password, hashedPassword);
    //       } catch (error) {
    //         console.error("Error al comparar contraseñas:", error);
    //         return false;
    //       }
    // }

}

export default UserManager; 

