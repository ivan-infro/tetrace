/**
 * Created by infro on 09.11.14.
 */
var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game-div');

var carSpeed = 10;

// virtual gamecontroller
var left = false;
var right = false;

var mainState = {
    preload: function () {
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('car', 'assets/car.png');
        game.load.image('star', 'assets/star.png');

        //gamepad buttons
        game.load.spritesheet('buttonhorizontal', 'assets/buttons/buttons-big/button-horizontal.png', 96, 64);
    },
    create: function () {

        // create our virtual game controller buttons
        buttonleft = game.add.button(10, 400, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        buttonleft.fixedToCamera = true;
        buttonleft.events.onInputOver.add(function () {
            left = true;
        });
        buttonleft.events.onInputOut.add(function () {
            left = false;
        });
        buttonleft.events.onInputDown.add(function () {
            left = true;
        });
        buttonleft.events.onInputUp.add(function () {
            left = false;
        });

        buttonright = game.add.button(210, 400, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        buttonright.fixedToCamera = true;
        buttonright.events.onInputOver.add(function () {
            right = true;
        });
        buttonright.events.onInputOut.add(function () {
            right = false;
        });
        buttonright.events.onInputDown.add(function () {
            right = true;
        });
        buttonright.events.onInputUp.add(function () {
            right = false;
        });

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", {font: "30px Arial", fill: "#ffffff"});

        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.car = this.game.add.sprite(160, 400, 'car');
        this.car.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.car);
        this.car.body.collideWorldBounds = true;

        this.traffic = game.add.group(); // Create a group
        this.traffic.enableBody = true; // Add physics to the group
        this.traffic.createMultiple(6, 'car'); // Create 9 traffic cars

        this.emitter = game.add.emitter(0, 0, 200);
        this.emitter.makeParticles('star');

        this.timer = game.time.events.loop(700, this.addRowOfTrafficCars, this);
    },
    update: function () {
        // Check key states every frame.
        // Move ONLY one of the left and right key is hold.
        if (this.car.alive) {
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) || left) {
                if (this.car.x - carSpeed > 25) { // #TODO magic number
                    this.car.x -= carSpeed;
                }
            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || right) {
                if (this.car.x + carSpeed < 295) { // #TODO magic number
                    this.car.x += carSpeed;
                }
            }
        }

        game.physics.arcade.overlap(this.car, this.traffic, this.hitTraffic, null, this);
    },

    addTrafficCar: function (x, y) { // #TODO refactor code
        var trafficCar = this.traffic.getFirstDead();

        trafficCar.reset(x, y);
        trafficCar.anchor.setTo(0.5, 0.5);

        trafficCar.body.velocity.y = 400;

        // Kill the traffic line when it's no longer visible
        trafficCar.checkWorldBounds = true;
        trafficCar.outOfBoundsKill = true;
    },

    addRowOfTrafficCars: function () {
        this.score += 1;
        this.labelScore.text = this.score;

        var hole = Math.floor(Math.random() * 3);

        for (var i = 0; i < 3; ++i) {
            if (i != hole) {
                this.addTrafficCar((i + 1) * 90 - 25, 0); // #TODO magic number
            }
        }
    },

    hitTraffic: function () {
        // If the car has already hit a traffic car, we have nothing to do
        if (this.car.alive == false)
            return;

        this.emitter.x = this.car.x;
        this.emitter.y = this.car.y;
        this.emitter.start(true, 500, null, 5);

        // Set the alive property of the car to false
        this.car.alive = false;

        // Prevent new traffic cars from appearing
        game.time.events.remove(this.timer);
        game.time.events.add(1000, this.restartGame, this);

        // Go through all the traffic cars, and stop their movement
        this.traffic.forEachAlive(function (p) {
            p.body.velocity.y = 0;
        }, this);

    },

    restartGame: function () {
        game.state.start('main');
    }
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');