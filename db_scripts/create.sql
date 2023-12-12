drop database if exists memoriesdb;
create database memoriesdb;

use memoriesdb;

create table user (
    usr_id int not null auto_increment,
    usr_name varchar(60) not null,
    usr_pass varchar(200) not null,
    usr_current_pet int not null,
    primary key (usr_id));

create table pet (
    pet_id int not null auto_increment,
    pet_name varchar(60) not null,
    primary key (pet_id));

create table user_pet (
    up_id int not null auto_increment,
    up_user_id int references user(usr_id),
    up_pet_id int not null references pet(pet_id),
    up_hungry int not null,
    up_happiness int not null,
    up_fitness int not null,
    up_state_id int not null references pet_state(ps_id), 
    primary key (up_id));

create table pet_state (
    ps_id int not null auto_increment,
    ps_name varchar (60) not null,
    primary key (ps_id));

insert into pet_state (ps_name) values ('Dirty');
insert into pet_state (ps_name) values ('Clean');
insert into pet_state (ps_name) values ('Sad');
insert into pet_state (ps_name) values ('Happy');

insert into pet (pet_id, pet_name) values 
   (1, "Cipher"),
   (2, "Armitager"),
   (3, "Armitager"),
   (4, "Armitager"),
   (5, "Gunnar");

   INSERT INTO user VALUES (1,'me','$2b$10$Wemfac2wY/7RSCdKxuYUL.GV2clfhXC66OL76uCpDFUmpYZ/bGZtW', 1);