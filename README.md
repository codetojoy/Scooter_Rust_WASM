## Scooter_Rust_WASM

### Summary

* Early prototype for the Door-Prize Picker app (examples [here](https://github.com/peidevs/Resources/blob/master/Examples.md))
* This is a work-in-progress with plenty of TODOs
* The basic idea:
    - Event attendees are players in a Rogue-like game, powered by [rot.js](https://ondras.github.io/rot.js/hp/)
    - Players are chased and eliminated by a meanie, "Brutto Bug" (Italian for "nasty bug")  
    - The last player caught is the winner

### Credit

* This example was spawned by an example in [this book](https://pragprog.com/titles/khrust/programming-webassembly-with-rust/)
* The code for that book is licensed explicitly that it cannot be used for training material
    - I feel that this work is sufficiently different from the original that it can be licensed as Apache 2

### TODO

* increase # players from 5 to 10
    - when a player is caught, replenish that spot from a master list of N players
* list player names in sidebar
* review code design in terms of JS/Rust boundary
* consider a smaller world, for testing
* add a "Play" button to start the game
* add facility to manage players ?
* consider TypeScript
