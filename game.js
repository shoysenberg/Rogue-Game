"use strict";

const fields = {
    0: [
        "wwwwwwwwwwwwwwww",
        "wp--w-----wh---w",
        "w---ww---www-www",
        "w---e----e--ew-w",
        "wwwww--h-------w",
        "wh-w-e-wwwww-e-w",
        "w---h------www-w",
        "wwww---se--wh--w",
        "w-h--e-----ws--w",
        "wwwwwwwwwwwwwwww"
    ],
    1: [
        "wwwwwwwwwwwwwwww",
        "w--h-w---w-----w",
        "wh---w-e-w-e---w",
        "w--w-wh--wh----w",
        "wwwweww-wwww-www",
        "wp----eh----e-hw",
        "www-wwww-ww-wwww",
        "ws--hw-h-wh-w-hw",
        "w--e-w---w-s---w",
        "wwwwwwwwwwwwwwww"
    ],
    2: [
        "wwwwwwwwwwwwwwww",
        "wh--e-----hw---w",
        "w--sw------w---w",
        "wwwww------w---w",
        "w--hw-------e-hw",
        "w---w--p---wwwww",
        "www-w----------w",
        "we---------w-e-w",
        "w---h----ehwh-sw",
        "wwwwwwwwwwwwwwww"
    ],
    3: [
        "wwwwwwwwwwwwwwww",
        "w----w---w-----w",
        "wh---wh-ewh--e-w",
        "wwewwww-www--www",
        "ws--hw---w-----w",
        "w------p----e--w",
        "w----w---w-----w",
        "w-ewwww-wwwww--w",
        "wh---whehws---hw",
        "wwwwwwwwwwwwwwww"
    ],
    4: [
        "wwwwwwwwwwwwwwww",
        "wh-w------w----w",
        "w-e--hw-www----w",
        "ww-wwwwshw---e-w",
        "wh-w--ww-------w",
        "w--we--we--wwwww",
        "w-----hw--hws--w",
        "w--wwwwwwwww---w",
        "wh-----h-e----pw",
        "wwwwwwwwwwwwwwww"
    ],
    5: [
        "wwwwwwwwwwwwwwww",
        "w---e----w----sw",
        "w-hw-----wwh---w",
        "wwww-e---hww-www",
        "w--------------w",
        "wh--e-h--e----pw",
        "ww-wwwwwwwww---w",
        "w-e-w-----hw---w",
        "ws--wh-e-------w",
        "wwwwwwwwwwwwwwww"
    ]
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

class Game {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext("2d");
        this.canvasWidth = 1024;
        this.canvasHeight = 640;
        this.fieldNumber = randomInteger(0, 5);
        
        this.timer = 0;
        this.damage_timer = 0;
        this.default_attack_timer = 0;
        this.circle_attack_timer = 0;

        this.hero = new Image();
        this.hero.src = "./images/hero/hero.png";
        this.hero.cords = {x: 0, y: 0, v: 10};
        this.hero.health = 100;
        this.hero.animation = {right: 1, left: 1, top: 1, bottom: 1}
        this.hero.direction = "bottom";
        this.hero.default_attack_flag = false;
        this.hero.circle_attack_flag = false;
        this.hero.damage = 25;

        this.default_attack = new Image();
        this.default_attack.src = "./images/attack/bottom/1.png";
        this.default_attack.animation = 1;
        this.default_attack.cooldown_state = false;
        this.default_attack.cooldown_time = 1;

        this.circle_attack = new Image();
        this.circle_attack.src = "./images/circle/1.png";
        this.circle_attack.animation = 1;
        this.circle_attack.cooldown_state = false;
        this.circle_attack.cooldown_time = 2;

        this.enemies = [];
        this.enemies.speed = 16;
        this.chase_enemy_index = [];

        this.swords = new Image();
        this.swords.src = "./images/tile-SW.png";
        this.swords.coords = [];

        this.potions = new Image();
        this.potions.src = "./images/tile-HP.png";
        this.potions.coords = [];

        this.wall = new Image();
        this.wall.src = "./images/tile-W.png";

        this.walls_positions = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
            7: [],
            8: [],
            9: [],
        };
        var x = 0;
        var y = 0;
        var enemy_number = 0;

        // Цикл для определния расположения всех игровых объектов на карте
        for(var i = 0; i < 10; i++) {
            x = 0;
            for(var j = 0; j < 16; j++) {
                if(fields[this.fieldNumber][i][j] == "w") {
                    this.walls_positions[i].push(j);
                } else if(fields[this.fieldNumber][i][j] == "p") {
                    this.hero.cords.x = x;
                    this.hero.cords.y = y;
                } else if(fields[this.fieldNumber][i][j] == "h") {
                    var health_cords = {x: x, y: y};
                    this.potions.coords.push(health_cords);
                } else if(fields[this.fieldNumber][i][j] == "s") {
                    var sword_cords = {x: x, y: y};
                    this.swords.coords.push(sword_cords);
                } else if(fields[this.fieldNumber][i][j] == "e") {
                    var enemy_sprite = new Image();
                    enemy_sprite.src = "./images/enemy/enemy.png";
                    var entity = {x: x, y: y, sprite: enemy_sprite, animation: 1, health: 100, seeHero: false, number: enemy_number};
                    enemy_number++;
                    this.enemies.push(entity);
                }
                x += 64;
            }
            y += 64;
        }

        this.background = new Image();
        this.background.src = "./images/tile-.png";
    }

    update() {
        // Счётчик для контроля времени увеличенного урона у героя
        if(this.damage_timer + 5 == new Date().getSeconds()) this.hero.damage = 25;

        // Удвоение наносимого главным персонажем урона с последующим удалением меча с поля
        for(var i = 0; i < this.swords.coords.length; i++) {
            if(Math.abs(this.swords.coords[i].x - this.hero.cords.x) < 25 && Math.abs(this.swords.coords[i].y - this.hero.cords.y) < 25) {
                this.swords.coords.splice(i, 1);
                this.hero.damage = 50;
                this.damage_timer = new Date().getSeconds();
            }
        }

        // Восстановление здоровья героя с последующим удалением зелья с поля
        for(var i = 0; i < this.potions.coords.length; i++) {
            if(Math.abs(this.potions.coords[i].x - this.hero.cords.x) < 25 && Math.abs(this.potions.coords[i].y - this.hero.cords.y) < 25) {
                this.potions.coords.splice(i, 1);
                this.hero.health + 50 > 100 ? this.hero.health = 100 : this.hero.health += 50;
            }
        }

        // Удаление информации о убитом враге
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.enemies[i].health == 0 || this.enemies[i].health < 0) {
                var splice_index = this.chase_enemy_index.indexOf(this.enemies[i].number);
                if(splice_index != -1) {
                    this.chase_enemy_index.splice(this.chase_enemy_index.indexOf(this.enemies[i].number), 1);
                    this.enemies.splice(i, 1);
                }
            }
        }

        if(this.enemies.length != 0) {
            var random_int = randomInteger(0, 3);
            var index_enemy = randomInteger(0, this.enemies.length - 1);
            while(this.chase_enemy_index.indexOf(index_enemy) != -1 && 
                    this.enemies.length != 1
                ) index_enemy = randomInteger(0, this.enemies.length - 1);

            // Функция для контроля количества врагов, преследующих героя
            this.enemySeeHero(this.enemies[index_enemy]);

            // Обработка координат врагов, которые преследуют главного героя
            for(var enemy of this.enemies) {
                if(this.timer % 10 == 0 && this.chase_enemy_index.indexOf(enemy.number) != -1) {
                    if(this.hero.cords.x - enemy.x < 32 && this.checkWall(enemy, "left")) {
                        enemy.x -= this.enemies.speed;
                        this.animateEnemy(enemy, "left");
                    }
                    if(this.hero.cords.x - enemy.x > -32 && this.checkWall(enemy, "right")) {
                        enemy.x += this.enemies.speed;
                        this.animateEnemy(enemy, "right");
                    }
                    if(this.hero.cords.y - enemy.y < -32 && this.checkWall(enemy, "top")) {
                        enemy.y -= this.enemies.speed;
                        this.animateEnemy(enemy, "top");
                    }
                    if(this.hero.cords.y - enemy.y > 32 && this.checkWall(enemy, "bottom")) {
                        enemy.y += this.enemies.speed;
                        this.animateEnemy(enemy, "bottom");
                    }

                    // Атака врагом главного героя
                    if(Math.abs(this.hero.cords.x - enemy.x) <= 48 && Math.abs(this.hero.cords.y - enemy.y) <= 48 && this.timer % 80 == 0) {
                        this.hero.health -= 10;
                    }
                }
            }

            // Рандомного передвижения врагов
            if(this.timer % 16 == 0 && (this.enemies.length != 1 || this.chase_enemy_index.length != 1)) {
                if(random_int == 0) {
                    if(this.checkWall(this.enemies[index_enemy], "top")) {
                        this.enemies[index_enemy].y -= this.enemies.speed;
                        this.animateEnemy(this.enemies[index_enemy], "top")
                    }
                } else if(random_int == 1) {
                    if(this.checkWall(this.enemies[index_enemy], "left")) {
                        this.enemies[index_enemy].x -= this.enemies.speed;
                        this.animateEnemy(this.enemies[index_enemy], "left")
                    }
                } else if(random_int == 2) {
                    if(this.checkWall(this.enemies[index_enemy], "bottom")) {
                        this.enemies[index_enemy].y += this.enemies.speed;
                        this.animateEnemy(this.enemies[index_enemy], "bottom")
                    }
                } else {
                    if(this.checkWall(this.enemies[index_enemy], "right")) {
                        this.enemies[index_enemy].x += this.enemies.speed;
                        this.animateEnemy(this.enemies[index_enemy], "right")
                    }
                }
            }
        }

        ++this.timer;
    }

    // Вторая функция игрового цикла - отрисовка
    draw() {
        // Поочерёдно отрисовываем все имеющиеся объекты
        this.context.drawImage(this.background, 0, 0, 1024, 640);
        for(var i = 0; i < 10; i++) {
            for(var wall of this.walls_positions[i]) this.context.drawImage(this.wall, wall * 64, i*64, 64, 64);
        }
        for(var sword of this.swords.coords) this.context.drawImage(this.swords, sword.x, sword.y, 64, 64);
        for(var potion of this.potions.coords) this.context.drawImage(this.potions, potion.x, potion.y, 64, 64);
        for(var enemy of this.enemies) {
            this.context.drawImage(enemy.sprite, enemy.x, enemy.y, 64, 64);
            this.drawHealthEnemy(enemy);
        }

        // Отрисовка главного героя
        this.context.drawImage(this.hero, this.hero.cords.x, this.hero.cords.y, 64, 64);
        this.drawHealthHero();

        // Таймер для анимации обычной атаки
        if(this.default_attack_timer + 30 == this.timer) {
            this.hero.default_attack_flag = false;
            this.default_attack.animation = 1;
        }

        // Отрисовка анимации обычно атаки, относительно направления героя
        if(this.hero.default_attack_flag) {
            if(this.timer % 5 == 0) {
                if(this.hero.direction == "top") {
                    this.context.drawImage(this.default_attack, this.hero.cords.x - 20, this.hero.cords.y - 40, 100, 100);
                } else if(this.hero.direction == "bottom") {
                    this.context.drawImage(this.default_attack, this.hero.cords.x - 20, this.hero.cords.y - 10, 100, 100);
                } else if(this.hero.direction == "right") {
                    this.context.drawImage(this.default_attack, this.hero.cords.x + 10, this.hero.cords.y - 20, 100, 100);
                } else {
                    this.context.drawImage(this.default_attack, this.hero.cords.x - 40, this.hero.cords.y - 30, 100, 100);
                }
                this.default_attack.animation == 6 ? this.default_attack.animation = 1 : this.default_attack.animation++;
                this.default_attack.src = `./images/attack/${this.hero.direction}/${this.default_attack.animation}.png`
            }
        }

        // Таймер для анимации круговой атаки
        if(this.circle_attack_timer + 30 == this.timer) {
            this.hero.circle_attack_flag = false;
            this.circle_attack.animation = 1;
        }

        // Отрисовка анимации круговой атаки, относительно направления героя
        if(this.hero.circle_attack_flag) {
            if(this.timer % 5 == 0) {
                this.context.drawImage(this.circle_attack, this.hero.cords.x - 45, this.hero.cords.y - 60, 150, 150);
                this.circle_attack.animation == 4 ? this.circle_attack.animation = 1 : this.circle_attack.animation++;
                this.default_attack.src = `./images/circle/${this.circle_attack.animation}.png`
            }
        }
    }

    // Последняя и главная функция в игровом цикле
    gameLoop() {
        this.update();
        this.draw();

        // Условия, при нарущении которых, игра заканчивается
        if(this.hero.health > 4 && this.enemies.length != 0) {
            window.requestAnimationFrame(() => this.gameLoop());
        } else {
            this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            document.querySelector('span').style.display = 'block';

            const btn = document.createElement('button');
            btn.innerText = "Restart";
            btn.onclick = () => { location.reload() };
            document.querySelector('.field').prepend(btn);
        }
    }

    // Функция для перемещения героя вправо
    heroMoveRight() {
        if(this.checkWall("hero", "right")) this.hero.cords.x += this.hero.cords.v;
        this.animateHero("right");
    }

    // Функция для перемещения героя влево
    heroMoveLeft() {
        if(this.checkWall("hero", "left")) this.hero.cords.x -= this.hero.cords.v;
        this.animateHero("left");
    }

    // Функция для перемещения героя вверх
    heroMoveUp() {
        if(this.checkWall("hero", "top")) this.hero.cords.y -= this.hero.cords.v;
        this.animateHero("top");
    }

    // Функция для перемещения героя вниз
    heroMoveDown() {
        if(this.checkWall("hero", "bottom")) this.hero.cords.y += this.hero.cords.v;
        this.animateHero("bottom");
    }

    // Функция стандартной атаки
    heroAttack() {
        this.default_attack.cooldown_state = true;
        this.default_attack_timer = this.timer;
        this.hero.default_attack_flag = true;
        var near_index;

        // Ищем индекс ближайшего к герою врага
        var min_distance = 2000;
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.chase_enemy_index.indexOf(this.enemies[i].number) != -1) {
                if(Math.abs((this.hero.cords.x + this.hero.cords.y) - (this.enemies[i].x - this.enemies[i].y)) < min_distance) {
                    min_distance = Math.abs((this.hero.cords.x + this.hero.cords.y) - (this.enemies[i].x - this.enemies[i].y));
                    near_index = i;
                }
            }
        }

        // И по этому индексу наносим урон
        if(near_index != undefined) {
            if(Math.abs(this.hero.cords.x - this.enemies[near_index].x) < 100 && Math.abs(this.hero.cords.y - this.enemies[near_index].y) < 100) {
                this.enemies[near_index].health -= this.hero.damage;
                near_index = 0;
            }
        }

        // Для того, чтобы нельзы было зажать кнопку атаки, ставим кулдаун на удар
        setTimeout(() => { this.default_attack.cooldown_state = false; }, this.default_attack.cooldown_time * 1000);
    }

    circleHeroAttack() {
        this.circle_attack.cooldown_state = true;
        this.circle_attack_timer = this.timer;
        this.hero.circle_attack_flag = true;

        // Наносим урон всем ближним противникам
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.chase_enemy_index.indexOf(this.enemies[i].number) != -1) {
                if(Math.abs(this.hero.cords.x - this.enemies[i].x) < 100 && Math.abs(this.hero.cords.y - this.enemies[i].y) < 100) {
                    this.enemies[i].health -= this.hero.damage;
                }
            }
        }

        setTimeout(() => { this.circle_attack.cooldown_state = false; }, this.circle_attack.cooldown_time * 1000)
    }

    // Функция для отрисовки HP главного героя
    drawHealthHero() {
        this.context.beginPath();
        this.context.moveTo(this.hero.cords.x + 5, this.hero.cords.y);
        this.context.lineTo(this.hero.cords.x + 5 + this.hero.health / 2, this.hero.cords.y);
        if(this.hero.health <= 20) {
            this.context.strokeStyle = "red";   
        } else if(this.hero.health <= 50 || this.hero.damage != 25 || (this.hero.health <= 100 && this.hero.damage != 25)) {
            this.context.strokeStyle = "orange";
        } else {
            this.context.strokeStyle = "lightgreen";
        }
        this.context.lineWidth = "4";
        this.context.stroke();
        this.context.closePath();
    }

    // Функция для отрисовки HP врагам
    drawHealthEnemy(entity) {
        this.context.beginPath();
        this.context.moveTo(entity.x + 5, entity.y);
        this.context.lineTo(entity.x + 5 + entity.health / 2, entity.y);
        this.context.strokeStyle = "red";
        this.context.lineWidth = "4";
        this.context.stroke();
        this.context.closePath();
    }

    // Функция для анимации главного героя
    animateHero = (direct) => {
        this.hero.src = `./images/hero/${direct}/${this.hero.animation[direct]}.png`;
        this.hero.direction = direct;
        if(this.timer % 3 == 0) {
            this.hero.animation[direct] == 6 ? this.hero.animation[direct] = 1 : this.hero.animation[direct]++;
        }
    }

    // Функция для анимации врагов
    animateEnemy(enemy, direct) {
        var src = `./images/enemy/${direct}/${enemy.animation}.png`
        enemy.sprite.src = src;
        enemy.animation == 6 ? enemy.animation = 1 : enemy.animation++;
    }

    // Функция, определяющая есть ли препятствие на пути врага, либо главноего персонажа
    checkWall(entity, direct) {
        entity != "hero" ? "" : entity = this.hero.cords;
        switch(direct) {
            case "left":
                var left_index = Math.ceil(entity.x / 64) - 1;
                var has_element = false;
                if(this.walls_positions[Math.floor((entity.y / 64) + 0.155)].indexOf(left_index) != -1 ||
                    this.walls_positions[Math.round((entity.y / 64) + 0.155)].indexOf(left_index) != -1
                ) has_element = true;

                if(has_element && Math.abs(left_index * 64 - entity.x) < 72) return false;
                return true;
            case "right":
                var right_index = Math.ceil(entity.x / 64) + 1;
                var has_element = false;
                if(this.walls_positions[Math.floor((entity.y / 64) + 0.155)].indexOf(right_index) != -1 ||
                    this.walls_positions[Math.round((entity.y / 64) + 0.155)].indexOf(right_index) != -1
                ) has_element = true;

                if(has_element && Math.abs(right_index * 64 - entity.x) < 72) return false;
                return true;
            case "top":
                var top_index = Math.floor(entity.y / 64) - 1 != -1 ? Math.floor(entity.y / 64) - 1 : 0;
                var has_element;
                if(this.walls_positions[top_index].indexOf(Math.floor((entity.x / 64) + 0.155)) != -1 || 
                    this.walls_positions[top_index].indexOf(Math.round((entity.x / 64) + 0.155)) != -1
                ) has_element = true;
                if(has_element && Math.abs(top_index * 64 - entity.y) < 72) return false;
                return true;
            case "bottom":
                var bottom_index = Math.round(entity.y / 64) + 1 != 10 ? Math.round(entity.y / 64) + 1 : 9;
                var has_element = false;
                if(this.walls_positions[bottom_index].indexOf(Math.floor((entity.x / 64) + 0.155)) != -1 || 
                    this.walls_positions[bottom_index].indexOf(Math.round((entity.x / 64) + 0.155)) != -1
                ) has_element = true;
                if(has_element && Math.abs(bottom_index * 64 - entity.y) < 72) return false;
                return true;
        }
    }

    // Функция для определения врагов, в полезрения которых, попал главный герой, для дальнейшего преследования
    enemySeeHero(entity) {
        if(this.hero.cords.x - entity.x > -150 && 
            this.hero.cords.x - entity.x < 150 &&
            this.hero.cords.y - entity.y > -150 &&
            this.hero.cords.y - entity.y < 150
        ) {
            this.chase_enemy_index.indexOf(entity.number) == -1 ? this.chase_enemy_index.push(entity.number) : "";
        } else {
            this.chase_enemy_index.indexOf(entity.number) != -1 ? this.chase_enemy_index.splice(this.chase_enemy_index.indexOf(entity.number), 1) : "";
        }
    }

    // Функция заливающая всё поле стенами
    fill() {
        var x = 0;
        var y = 0;
        for(var i = 0; i < 10; i++) {
            x = 0;
            for(var j = 0; j < 16; j++) {
                this.walls_positions[i].push(j);
                x += 64;
            }
            y += 64;
        }

        this.wall.onload = () => {
            for(var i = 0; i < 10; i++) {
                for(var wall of this.walls_positions[i]) this.context.drawImage(this.wall, wall * 64, i*64, 64, 64);
            }
        }
    }

    // Функция инициализации
    init() {
        this.background.onload = () => {
            this.context.drawImage(this.background, 0, 0, 1024, 640);
        };

        window.addEventListener('keydown', (e) => {
            if(e.key == 'w' || e.key == 'ц' || e.key == 'W' || e.key == 'Ц') this.heroMoveUp();
            if(e.key == 'a' || e.key == 'ф' || e.key == 'A' || e.key == 'Ф') this.heroMoveLeft();
            if(e.key == 's' || e.key == 'ы' || e.key == 'S' || e.key == 'Ы') this.heroMoveDown();
            if(e.key == 'd' || e.key == 'в' || e.key == 'D' || e.key == 'В') this.heroMoveRight();
            if(e.key == 'f' || e.key == 'а' || e.key == 'F' || e.key == 'А') { !this.default_attack.cooldown_state ? this.heroAttack() : ''; }
            if(e.code == "Space") {
                e.preventDefault();
                !this.circle_attack.cooldown_state ? this.circleHeroAttack() : '';
            }
        });

        this.gameLoop();
    }
}