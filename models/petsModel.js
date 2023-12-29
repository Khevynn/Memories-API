const pool = require("../config/database");
const User = require("./usersModel");
const Consts = require("../config/Consts");

class Pet {
    constructor(id, name, user_id, pet_id, hungry, happiness, hygiene, state, humor) {
        this.id = id;
        this.name = name
        this.user_id = user_id;
        this.pet_id = pet_id;
        this.hungry = hungry;
        this.happiness = happiness;
        this.hygiene = hygiene;
        this.state = state;
        this.humor = humor;
    }

    // Get the info of all pets of the user
    static async GetAllPets(userInfo) {
        try {
            // Get the pets
            let [pets] = await pool.query(`select * from user_pet, pet_state, pet_humor 
                                            where up_user_id = ? and 
                                            up_state_id = ps_id and 
                                            up_humor_id = ph_id`, [userInfo.id]);
            // If the user has no pets
            if (!pets.length)
                return { status: 404, data: { msg: 'No pets!' } };

            let result = [];
            // For each pet in database create a new object "Pet"
            for (let pet of pets) {
                result.push(
                    new Pet(pet.up_id,
                        pet.up_pet_name,
                        pet.up_user_id,
                        pet.up_pet_id,
                        pet.up_hungry,
                        pet.up_happiness,
                        pet.up_hygiene,
                        pet.ps_name,
                        pet.ph_name
                    )
                );
            }
            return { status: 200, data: { msg: "Successfuly Searched!", result: result } }
        } catch (err) {
            console.log(err);
            return { status: 500, data: { msg: err } }
        }
    }

    // Get a selected pet info
    static async GetCurrentPetInfo(userInfo) {
        try {
            // Get the pets from database
            let [pets] = await pool.query(`select * from user, user_pet, pet_humor, pet_state
                                            where up_user_id = usr_id and 
                                            up_pet_id = usr_current_pet and
                                            up_humor_id = ph_id and
                                            up_state_id = ps_id and
                                            usr_id = ?`, [userInfo.id]);
            // If there's no pets 
            if (!pets.length)
                return { status: 404, data: { msg: 'No pet found!' } };

            // Create a new object "Pet" and set it values
            let pet = new Pet();
            pet.id = pets[0].up_id;
            pet.user_id = pets[0].up_user_id;
            pet.pet_id = pets[0].up_pet_id;
            pet.name = pets[0].up_pet_name;
            pet.hungry = pets[0].up_hungry;
            pet.happiness = pets[0].up_happiness;
            pet.hygiene = pets[0].up_hygiene;
            pet.state = pets[0].ps_name;
            pet.humor = pets[0].ph_name;

            return { status: 200, pet }
        } catch (err) {
            console.log(err);
            return { status: 500,  msg: err }
        }
    }
    
    // Add a new pet to the user
    static async AddPet(petInfo) {
        try {
            // Check if the user already have this pet
            let [userInfo] = await pool.query(`select * from user_pet where up_user_id = ? and up_pet_id = ?`, [petInfo.user_id, petInfo.id]);

            // If "yes" then return a log
            if (userInfo.length)
                return { status: 403, data: { msg: "You already have this pet!" } }

            // Check if the selected pet exists
            let [pets] = await pool.query(`select * from pet where pet_id = ?`, [petInfo.id]);

            // If it doesn't find any pet
            if (!pets.length)
                return { status: 404, data: { msg: "Invalid pet!" } };

            // Add the pet info to the database
            await pool.query(`insert into user_pet values (default, ?, ?, ?, 100, 100, 100, 1, 1)`, [petInfo.user_id, petInfo.id, pets[0].pet_name]);

            // Update the current pet of the player if he doesn't have a pet
            let [user] = await pool.query(`select * from user where usr_id = ?`, [petInfo.user_id]);

            console.log(user[0]);
            if (user[0].usr_current_pet == 0)
                await pool.query(`update user set usr_current_pet = ? where usr_id = ?`, [petInfo.id, petInfo.user_id]);

            return { status: 200, data: { msg: "Successfuly Added!" } }
        } catch (err) {
            console.log(err);
            return { status: 500, data: { msg: err } }
        }
    }

    static async ChangeName(petInfo, newName) {
        try {
            // Find the pet in the database
            let [pet] = await pool.query(`select * from user_pet where up_user_id = ? and up_pet_id = ?`, [petInfo.id, petInfo.user_id]);

            if (!pet.length)
                return { status: 404, data: { msg: "Invalid pet id!" } }

            // Update the name
            await pool.query(`update user_pet set up_pet_name = ? where up_user_id = ? and up_pet_id = ?`, [newName, petInfo.user_id, petInfo.id]);

            return { status: 200, data: { msg: "Successfuly changed!" } }
        } catch (err) {
            console.log(err);
            return { status: 500, data: { msg: err } }
        }
    }

    static async ChangeCurrentPet(newPetId, userInfo) {
        try {
            let [user] = await pool.query(`select * from user where usr_id = ?`, [userInfo.id]);
            if (user[0].usr_current_pet == newPetId)
                return { status: 403, data: { msg: "That's already your current pet!" } }

            // Find the pet in the database
            let [pet] = await pool.query(`select * from user_pet where up_user_id = ? and up_pet_id = ?`, [userInfo.id, newPetId]);

            if (!pet.length)
                return { status: 404, data: { msg: "Pet not found!" } }

            // Update the pet
            await pool.query(`update user set usr_current_pet = ? where usr_id = ?`, [newPetId, userInfo.id]);

            return { status: 200, data: { msg: "Successfuly changed!" } }
        } catch (err) {
            console.log(err);
            return { status: 500, data: { msg: err } }
        }
    }

    static async ChangeStats(Action, user_id) {
        try {
            let [pet] = await pool.query(`select * from user_pet, user, pet_state, pet_humor
                                            where up_user_id = usr_id and
                                            usr_current_pet = up_pet_id and
                                            up_state_id = ps_id and
                                            up_humor_id = ph_id and
                                            usr_id = ?`, [user_id]);
            if (!pet.length)
                return { status: 404, data: { msg: "No current pet found!" } }


            let userInfo = new User();
            userInfo.fruits = pet[0].usr_fruits;
            userInfo.currentPetInfo = pet[0].usr_current_pet;

            let currentPetInfo = new Pet();
            currentPetInfo.id = pet[0].up_pet_id;
            currentPetInfo.user_id = pet[0].up_user_id;
            currentPetInfo.hungry = pet[0].up_hungry;
            currentPetInfo.happiness = pet[0].up_happiness;
            currentPetInfo.hygiene = pet[0].up_hygiene;
            currentPetInfo.state = new PetState(pet[0].ps_id, pet[0].ps_name);
            currentPetInfo.humor = new PetHumor(pet[0].ph_id, pet[0].ph_name);

            let newPetInfo = new Pet();
            newPetInfo.state = currentPetInfo.state;
            newPetInfo.humor = currentPetInfo.humor;

            switch (Action) {
                case "Feed":
                    if (currentPetInfo.hungry >= 100)
                        return { status: 403, data: { msg: "Pet already fed!" } }

                    if (pet[0].usr_fruits <= 0)
                        return { status: 412, data: { msg: "Not enough fruits!" } }

                    newPetInfo.hungry = currentPetInfo.hungry + 5;
                    if (newPetInfo.hungry > 100) newPetInfo.hungry = 100;

                    userInfo.fruits--;
                    break;
                case "Exercise":
                    if (currentPetInfo.fitness >= 100)
                        return { status: 403, data: { msg: "Pet already exercised!" } }

                    if (currentPetInfo.hungry <= 2)
                        return { status: 412, data: { msg: "Can't exercise a hungry pet!" } }

                    newPetInfo.happiness = currentPetInfo.happiness + 2;
                    if (newPetInfo.happiness > 100) newPetInfo.happiness = 100;

                    newPetInfo.hungry = currentPetInfo.hungry - 2;
                    if (newPetInfo.hungry < 0) newPetInfo.hungry = 0;

                    newPetInfo.hygiene = currentPetInfo.hygiene - 2;
                    if (newPetInfo.hygiene < 0) newPetInfo.hygiene = 0;
                    break;
                case "Bath":
                    if (currentPetInfo.hygiene >= 100)
                        return { status: 403, data: { msg: "Pet already clean!" } }

                    newPetInfo.hygiene = currentPetInfo.hygiene + 2;
                    if (newPetInfo.hygiene > 100) newPetInfo.hygiene = 100;
                    break;
            }

            if (currentPetInfo.humor.name == "Sad" && newPetInfo.happiness >= Consts.HAPPINESS_VALUE_CHANGE) {
                newPetInfo.humor = new PetHumor(1, "Happy");
            }

            if (currentPetInfo.state.name == "Dirty" && newPetInfo.hygiene >= Consts.HYGIENE_VALUE_CHANGE) {
                newPetInfo.state = new PetState(1, "Clean");
            } else if (currentPetInfo.state.name == "Clean" && newPetInfo.hygiene <= Consts.HYGIENE_VALUE_CHANGE) {
                newPetInfo.state = new PetState(2, "Dirty");
            }

            // Updating the database with the new values of the pet
            await pool.query(`update user, user_pet set usr_fruits = ?, up_hungry = ?, up_happiness = ?, up_hygiene = ?, up_state_id = ?, up_humor_id = ? where up_user_id = ? and up_pet_id = ?`, [userInfo.fruits, newPetInfo.hungry, newPetInfo.happiness, newPetInfo.hygiene, newPetInfo.state.id, newPetInfo.humor.id, user_id, userInfo.active_pet]);
            return { status: 200, data: { msg: `${Action} successfuly done!` } }
        } catch (err) {
            console.log(err);
            return { status: 500, data: { msg: err } }
        }
    }
}

module.exports = Pet;