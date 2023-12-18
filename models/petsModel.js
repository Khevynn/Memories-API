const pool = require("../config/database");
const User = require("./usersModel");
const Consts = require("../config/Consts");

class Pet{
    constructor(id, name, user_id, hungry, happiness, fitness, state, humor){
        this.id = id;
        this.name = name
        this.user_id = user_id;
        this.hungry = hungry;
        this.happiness = happiness;
        this.fitness = fitness;
        this.state = state;
        this.humor = humor;
    }
    //Get the info of all pets of the user
    static async GetAllPets(userInfo){
        try{
            //Get the pets
            let [pets] = await pool.query(`select * from user_pet, pet_state, pet_humor 
                                            where up_user_id = ? and 
                                            up_state_id = ps_id and 
                                            up_humor_id = ph_id`, [userInfo.id]);
            //If the user has no pets
            if(!pets.length)
                return{status: 404, data: {msg: 'No pets!'}};

            let result = [];
            //For each pet in database create a new object "Pet"
            for(let pet of pets){
                result.push(
                    new Pet(pet.up_id, 
                        pet.up_pet_name, 
                        pet.up_user_id, 
                        pet.up_hungry, 
                        pet.up_happiness, 
                        pet.up_fitness, 
                        new PetState(pet.ps_id, pet.ps_name),
                        new PetHumor(pet.ph_id, pet.ph_name)
                    )
                );
            }
            return{status: 200, data: {msg: "Successfuly Searched!", result: result}}
        } catch(err){
            console.log(err);
            return{status: 500, data: {msg: err}}
        }
    }
    //Get a selected pet info
    static async GetCurrentPetInfo(userInfo){
        try{
            //Get the pets from database
            let [pets] = await pool.query(`select * from user, user_pet, pet_humor, pet_state
                                            where up_user_id = usr_id and 
                                            up_pet_id = usr_current_pet and
                                            up_humor_id = ph_id and
                                            up_state_id = ps_id and
                                            usr_id = ?`, [userInfo.id]);
            //If there's no pets 
            if(!pets.length) 
                return{status: 404, data: {msg: 'No pet found!'}};

            //Create a new object "Pet" and set it values
            let pet = new Pet();
            pet.id = pets[0].up_id;
            pet.name = pets[0].up_pet_name;
            pet.hungry = pets[0].up_hungry;
            pet.happiness = pets[0].up_happiness;
            pet.fitness = pets[0].up_fitness;
            pet.state = new PetState(pets[0].ps_id, pets[0].ps_name);
            pet.humor = new PetHumor(pets[0].ph_id, pets[0].ph_name);

            return{status: 200, data: {msg: "Successfuly Searched!", result: pet}}
        } catch(err){
            console.log(err);
            return{status: 500, data: {msg: err}}
        }
    }
    //Add a new pet to the user
    static async AddPet(petInfo){
        try{
            //Check if the user already have this pet
            let [userInfo] = await pool.query(`select * from user_pet where up_user_id = ? and up_pet_id = ?`, [petInfo.user_id, petInfo.id]);

            //If "yes" then return a log
            if(userInfo.length)
                return{status: 403, data: {msg: "You already have this pet!"}}

            //Check if the selected pet exists
            let [pets] = await pool.query(`select * from pet where pet_id = ?`, [petInfo.id]);

            //If it doesn't find any pet
            if(!pets.length) 
                return{status: 404, data: {msg: "Invalid pet!"}};

            //Add the pet info to the database
            await pool.query(`insert into user_pet values (default, ?, ?, ?, 100, 100, 100, 1, 1)`, [petInfo.user_id, petInfo.id, pets[0].pet_name]);

            //Update the current pet of the player if he doesn't have a pet
            [userInfo] = await pool.query(`select * from user where usr_id = ?`, [petInfo.user_id]);

            if(userInfo[0].usr_current_pet == 0)
                await pool.query(`update user set usr_current_pet = ? where usr_id = ?`, [petInfo.id, petInfo.user_id]);

            return{status: 200, data: {msg: "Successfuly Added!"}}
        } catch(err){
            console.log(err);
            return{status: 500, data: {msg: err}}
        }
    }

    static async ChangeName(petInfo, newName){
        try{
            //Find the pet in the database
            let [pet] = await pool.query(`select * from user_pet where up_user_id = ? and up_pet_id = ?`, [petInfo.id, petInfo.user_id]);

            if(!pet.length)
                return{status: 404, data: {msg: "Invalid pet id!"}}

            //Update the name
            await pool.query(`update user_pet set up_pet_name = ? where up_user_id = ? and up_pet_id = ?`, [newName, petInfo.user_id, petInfo.id]);

            return{status: 200, data: {msg: "Successfuly changed!"}}
        }catch(err){
            console.log(err);
            return{status: 500, data: {msg: err}}
        }
    }

    static async ChangeCurrentPet(newPetId, userInfo){
        try{
            let [user] = await pool.query(`select * from user where usr_id = ?`, [userInfo.id]);
            if(user[0].usr_current_pet == newPetId)
                return{status: 403, data: {msg: "That's already your current pet!"}}

            //Find the pet in the database
            let [pet] = await pool.query(`select * from user_pet where up_user_id = ? and up_pet_id = ?`, [userInfo.id, newPetId]);

            if(!pet.length)
                return{status: 404, data: {msg: "Pet not found!"}}

            //Update the pet
            await pool.query(`update user set usr_current_pet = ? where usr_id = ?`, [newPetId, userInfo.id]);

            return{status: 200, data: {msg: "Successfuly changed!"}}
        }catch(err){
            console.log(err);
            return{status: 500, data: {msg: err}}
        }
    }

    static async ChangeStats(Action){
        try{
            let [pet] = await pool.query(`select * from user_pet, user, pet_state, pet_humor
                                            where up_user_id = usr_id and
                                            usr_current_pet = up_pet_id and
                                            up_state_id = ps_id and
                                            up_humor_id = ph_id and
                                            usr_id = ?`, [user_id]);
            if(!pet.length)
                return{status: 404, data:{msg: "No current pet found!"}}

            
            let userInfo = new User();
            userInfo.fruits = pet[0].usr_fruits;
                
            let currentPetInfo = new Pet();
            currentPetInfo.id = pet[0].up_pet_id;
            currentPetInfo.user_id = pet[0].up_user_id;
            currentPetInfo.hungry = pet[0].up_hungry;
            currentPetInfo.happiness = pet[0].up_happiness;
            currentPetInfo.fitness = pet[0].up_fitness;
            currentPetInfo.state = new PetState(pet[0].ps_id, pet[0].ps_name);
            currentPetInfo.humor = new PetHumor(pet[0].ph_id, pet[0].ph_name);

            let newPetInfo = new Pet();

            switch(Action){
                case "Feed":
                    if(currentPetInfo.hungry >= 100)
                        return{status: 403, data: {msg: "Pet already fed!"}}
        
                    if(pet[0].usr_fruits <= 0)
                        return{status: 403, data: {msg: "Not enough fruits!"}}
        
                    newPetInfo.hungry = currentPetInfo.hungry + 5;
                    userInfo.fruits--;
        
                    await pool.query(`update user_pet set up_hungry = ? where up_usr_id = ? and up_pet_id = ?`, [newHungry, user_id, currentPetInfo.id]);
        
                    await pool.query(`update user set usr_fruits = ? where usr_id = ?`, [newFruits, user_id]);
                break;
                case "Exercise":
                    //TODO
                break;
                case "Bath":
                    //TODO
                break;
            }
        }catch(err){
            console.log(err);
            return{status: 500, data: {msg: err}}
        }
    }
}


//Aditional classes
class PetState{
    constructor(id, name){
        this.id = id;
        this.name = name;
    }
}

class PetHumor{
    constructor(id, name){
        this.id = id;
        this.name = name;
    }
}

module.exports = Pet;