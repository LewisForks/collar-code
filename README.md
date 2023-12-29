# Collar Code 🐶
A cool app that's in the works, and I'm too lazy to write about it.\
I'll write the readme later, lol.

## Installing
In my devenv I use [Laragon Desktop (Full)](https://laragon.org/download) 🐘 to host a MySQL database\
There's a `setup.sql` file to import the schemas\
Go to the main root of the project (NOT SRC FOLDER) and run `pnpm install`, it will generate a pnpm lockfile and install the node modules.\
To update the node modules if they change, use `pnpm update`.

## Running
Run `pnpm run dev` to launch the app in devmode, building will be done on the serverside so there is no present build command.