import mongoose from "mongoose"

const usersCollection = "usuarios";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String, //para login 
    age: Number,
    password: String, //para login
    rol: String //rol para ver hacia donde se dirige la página 
})

export const usersModel = mongoose.model(usersCollection, userSchema)