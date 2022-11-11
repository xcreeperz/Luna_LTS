class LunaMenu{
    constructor(root){
        //Luna
        this.root = root;

        this.$menu = $(`<div class = "luna-menu">
            <div class = "luna-menu-field">
                <div class = "luna-menu-field-item luna-menu-field-item-single">
                    单人模式
                </div>
                <br>
                <div class = "luna-menu-field-item luna-menu-field-item-multi">
                    多人模式
                </div>
                <br>
                <div class = "luna-menu-field-item luna-menu-field-item-settings">
                    设置
                </div>
            </div>
        </div>
        `);//相同class名统一外观属性，独立class名用于各自逻辑
        
        //html嵌套
        this.root.$luna.append(this.$menu);

        this.hide();    //进入界面先隐藏菜单，执行登录逻辑

        //绑定html对象
        this.$single = this.$menu.find('.luna-menu-field-item-single');
        this.$multi = this.$menu.find('.luna-menu-field-item-multi');
        this.$settings = this.$menu.find('.luna-menu-field-item-settings');

        this.start();
    }

    start(){
        this.add_listening_events();    //动作监听
    }

    add_listening_events(){
        let outer = this;
        //jQuery的事件方法
        this.$single.click(function(){
            outer.hide();
            //自定义函数show进入指定地图
            outer.root.play.show("single mode");
        });

        this.$multi.click(function(){
            outer.hide();
            outer.root.play.show("multi mode");
        });

        this.$settings.click(function(){
            //console.log("设置");
            outer.root.settings.logout_on_remote();
        });
    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }
}let GAME_OBJ = [];

class GameObj{
    constructor(){
        GAME_OBJ.push(this);
        this.started = false;
        this.timedelta = 0;
        this.uuid = this.create_uuid();
    }

    create_uuid(){
        let res = "";
        for(let i = 0; i < 8; i++){
            let x = parseInt(Math.floor(10 * Math.random()));
            res += x;
        }
        return res;
    }

    start(){
    }
    update(){
    }
    //从各自的组中删除
    on_destroy(){
    }
    //从全局对象组删除
    destroy(){
        this.on_destroy();

        for(let i = 0; i < GAME_OBJ.length; i++){
            if(GAME_OBJ[i] === this){
                GAME_OBJ.splice(i, 1);  //1个或2个参数表示删除指定数量元素，3个参数则为在该位置前一位插入序列，同时删除数可为0
                break;
            }
        }
    }
}

//接下来都是全局的，而且挺重要
let last_timestamp;

let GAME_ANIMATION = function(timestamp){
    for(let i = 0; i < GAME_OBJ.length; i++){
        let obj = GAME_OBJ[i];
        if(!obj.started){
            obj.start();
            obj.started = true;
        }else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();   //具体子类的刷新逻辑
        }
    }
    last_timestamp = timestamp; //timestamp第一次初始化last_timestamp，第二次开始update

    requestAnimationFrame(GAME_ANIMATION);
}
//js画面刷新函数，由设备反馈的刷新频率调整刷新频率，保证均衡流畅。参数是回调函数，每帧执行
//因此所有对象在构造后，就是在start和update
requestAnimationFrame(GAME_ANIMATION);
class ChatField{
    constructor(play){
        this.play = play;
        this.$history = $(`<div class="luna-chat-field-history"></div>`);
        this.$input = $(`<input type="text" class="luna-chat-field-input"></input>`);

        this.$history.hide();
        this.$input.hide();

        this.play.$play.append(this.$history);
        this.play.$play.append(this.$input);
        this.func_id = null;

        this.start();
    }
    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$input.keydown(function(e){
            if(e.which === 27){
                outer.hide_input();
                return false;
            }else if(e.which === 13){
                let username = outer.play.root.settings.username;
                let text = outer.$input.val();
                if(text){
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.play.mps.send_message(username, text);
                }
                return false;
            }
        })
    }

    render_message(message){
        return $(`<div>${message}</div>`);
    }
    add_message(username, text){
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history(){
        let outer = this;
        this.$history.fadeIn(); //jquery的淡入淡出，区别于show

        if(this.func_id) clearTimeout(this.func_id);
        this.func_id = setTimeout(function(){
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }

    show_input(){
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input(){
        this.$input.hide();
        this.play.game_map.$canvas.focus();
    }
}class GameMap extends GameObj{
    constructor(play){
        super();    //先注册为Obj
        this.play = play;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);  //表现为数组, tabindex=0 表示可聚焦
        //canvas是容器，getContext('2d')获得能绘制2D图像的对象
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.play.width;
        this.ctx.canvas.height = this.play.height;
        this.play.$play.append(this.$canvas);
    }

    start(){
        this.$canvas.focus();
    }

    resize(){
        this.ctx.canvas.width = this.play.width;
        this.ctx.canvas.height = this.play.height;
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class NoticeBoard extends GameObj{
    constructor(play){
        super();
        this.play = play;
        this.ctx = this.play.game_map.ctx;
        this.text = "已就绪 0 人";
    }
    start(){
    }

    write(text) {
        this.text = text;
    }
    update() {
        this.render();
    }

    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.play.width / 2, 20);
    }
}class Particle extends GameObj{
    constructor(play, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.play = play;
        this.ctx = this.play.game_map.ctx;

        this.x = x;
        this.y =y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.color = color;
        this.move_length = move_length;

        this.friction = 0.9;
        this.eps = 0.01;

        this.start();
    }

    start(){

    }

    update(){
        //速度过低或移动完成
        if(this.move_length < this.eps || this.speed < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;

        this.render();
    }

    render(){
        let scale = this.play.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends GameObj{
    constructor(play, x, y, radius, color, speed, type, username, photo){
        super();
        this.play = play;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.speed = speed;

        this.damage_vx = 0;
        this.damage_vy = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.radius = radius;
        this.color = color;

        this.type = type;
        this.ctx = this.play.game_map.ctx;
        this.eps = 0.01; //精度

        this.cur_skill = null;
        this.spent_time = 0;
        this.alive = true;

        this.fireballs = [];

        if(type !== "bot"){
            this.img = new Image();
            this.img.src = photo;
            // this.username = username;
        }

        if(this.type === "me"){
            this.fireball_coldtime = 1;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 1;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
        //this.start();
    }

    start(){
        //人机也算，在同步的基础上，这个直接在本地计算
        this.play.player_count++;
        this.play.notice_board.write("已就绪 " + this.play.player_count + " 人");
        if (this.play.player_count >= 3) {
            this.play.state = "fighting";
            this.play.notice_board.write("Fighting");
        }

        if(this.type === "me"){
            this.add_listening_events();    //玩家按键鼠移动
        }else if(this.type === "bot"){
            let tx = Math.random() * this.play.ratio;
            let ty = Math.random();
            this.move_to(tx, ty);   //人机随机游走
        }   //其他玩家不在本地计算，只从后端同步
    }

    //键鼠信号
    add_listening_events(){
        let outer = this;
        this.play.game_map.$canvas.on("contextmenu", function(){
            return false;   //屏蔽右键菜单
        });
        
        this.play.game_map.$canvas.mousedown(function(e){
            if(!outer.alive || outer.play.state !== "fighting"){
                return true;
            }
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3){
                let tx = (e.clientX - rect.left) / outer.play.scale;
                let ty = (e.clientY - rect.top) / outer.play.scale;
                outer.move_to(tx, ty);
                if(outer.play.mode === "multi mode"){
                    outer.play.mps.send_move_to(tx, ty);
                }
            } else if(e.which === 1){
                //tx ty应用于多个点击位置的技能
                let tx = (e.clientX - rect.left) / outer.play.scale;
                let ty = (e.clientY - rect.top) / outer.play.scale;
                if(outer.cur_skill === "fireball"){
                    if(outer.fireball_coldtime > outer.eps) return false;
                    let fireball = outer.shoot_fireball(tx, ty);
                    outer.cur_skill = null;
                    if(outer.play.mode === "multi mode"){
                        outer.play.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }else if(outer.cur_skill === "iceball"){
                    if(outer.iceball_coldtime > outer.eps) return false;
                    outer.shoot_iceball();
                    if(outer.play.mode === "multi mode"){
                        outer.send_shoot_iceball();
                    }
                    outer.cur_skill = null;
                    //待补充

                }else if(outer.cur_skill === "blink"){
                    if(outer.blink_coldtime > outer.eps) return false;
                    outer.blink(tx, ty);
                    if(outer.play.mode === "multi mode"){
                        outer.play.mps.send_blink(tx, ty);
                    }
                    outer.cur_skill = null;
                }
            }
        });

        this.play.game_map.$canvas.keydown(function(e){
            if(e.which === 13){
                if(outer.play.mode === "multi mode"){
                    outer.play.cf.show_input();
                    return false;
                }
            }else if(e.which === 27){
                if(outer.play.mode === "multi mode"){
                    outer.play.cf.hide_input();
                    return false;
                }
            }
            if(outer.play.state !== "fighting") return true;
            //Q火球
            if(e.which === 81){
                if(outer.fireball_coldtime > outer.eps) return true;
                outer.cur_skill = "fireball";
                return false;   // function退出
            //F闪现
            }else if(e.which === 70){
                if(outer.blink_coldtime > outer.eps) return true;
                outer.cur_skill = "blink";
                return false;
            //E冰球
            }else if(e.which === 69){
                if(outer.iceball_coldtime > outer.eps) return true;
                outer.cur_skill = "iceball";
                return false;
            }
        });
    }

    //(本地)受击逻辑
    is_attacked(angle, damage){
        //模拟血量
        this.radius -= damage;
        //受击粒子特效，随机数量/大小/角度/距离,速度与主体有关且递减
        for(let i = 0; i < 15 + Math.floor(Math.random() * 6); i++){
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.12;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 7;
            new Particle(this.play, x, y, radius, vx, vy, color, speed, move_length);
        }
        //死亡判定
        if(this.radius < this.eps){
            this.alive = false;
            this.destroy();
            return false;
        }
        //被击退的冲击信息
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 100;
    }

    //联机收到攻击者发来的受击同步信息，再在本地重新处理
    receive_attacked(x, y, angle, damage, ball_uuid, attacker){
        attacker.destroy_fireball(ball_uuid);    //销毁火球是受击同时发生的事件，所以放在受击函数中
        this.x = x; //受击运动过程和正常移动都需要及时同步，消除不同主机界面上的误差
        this.y = y;
        this.is_attacked(angle, damage);
    }

    shoot_fireball(tx, ty){
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.6;
        let move_length = 0.8;
        let fireball = new FireBall(this.play, this, x, y, radius, color, vx, vy, speed, move_length, 0.01);
        this.fireballs.push(fireball);
        this.fireball_coldtime = 1; //更新CD
        return fireball;
    }
    destroy_fireball(uuid){
        for(let i = 0; i < this.fireballs.length; i++){
            if(this.fireballs[i].uuid === uuid){
                let fireball = this.fireballs[i];
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty){
        let dist = this.get_dist(this.x, this.y, tx, ty);
        dist = Math.min(dist, 0.5);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += dist * Math.cos(angle);
        this.y += dist * Math.sin(angle);

        this.blink_coldtime = 1;
        this.move_length = 0;   //闪现会打断移动
    }

    shoot_iceball(){
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);  //有速度就会刷新位置
        this.vy = Math.sin(angle);
    }

    update(){
        //创建时间
        this.spent_time += this.timedelta / 1000;

        if(this.type === "me" && this.play.state === "fighting"){
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_coldtime(){
        //时间戳的单位一般是ms, 这里转为s
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move(){
        //人机出生3s后开始攻击
        if(this.type === "bot" && this.spent_time > 3 && Math.random() < 1 / 200.0){
            let player = this.play.players[Math.floor(this.play.players.length * Math.random())];   //指定一个目标
            if(player.alive && this.get_dist(this.x, this.y, player.x, player.y) > this.eps){
                let tx = player.x + player.vx * 0.5;    //预判位置
                let ty = player.y + player.vy * 0.5;
                this.shoot_fireball(tx, ty);
            }
        }
        //(所有角色)是否被击退
        if(this.damage_speed > this.eps){
            this.vx = this.vy = this.move_length = 0;

            this.x += this.damage_vx * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_vy * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else{
            //已经移动到目标
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                //人机则随机到下一个目标
                if(this.type === "bot"){
                    let tx = Math.random() * this.play.ratio;
                    let ty = Math.random();
                    this.move_to(tx, ty);
                }
            //未移动到目标
            }else{
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;  //当前到目标需要移动的距离
            }
        }
        this.render();
    }

    render(){
        let scale = this.play.scale;
        if(this.type !== "bot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        }else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if(this.type === "me" && this.play.state === "fighting"){
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime(){
        let scale = this.play.scale;

        let x = 1.5, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        
        if(this.fireball_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 1) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.blink_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 1) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_destroy(){
        if(this.type === "me"){
            this.play.state = "over";
        }
        let players = this.play.players;
        for(let i = 0; i < players.length; i++){
            if(players[i] === this){
                players.splice(i, 1);
                break;
            }
        }
    }
}
class FireBall extends GameObj{
    constructor(play, player, x, y, radius, color, vx, vy, speed, move_length, damage){
        super();
        this.play = play;
        this.player = player;

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.move_length = move_length;

        this.radius = radius;
        this.color = color;
        this.damage = damage;

        this.ctx = this.play.game_map.ctx;
        this.eps = 0.01;

        this.start();
    }
    start(){
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        if(this.play.mode === "multi mode"){
            this.play.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy();
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    //碰撞(目前只判定玩家)
    is_collision(player){
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if(distance < this.radius + player.radius){
            return true;
        }
        return false;
    }

    update(){
        this.update_move();
        if(this.player.type !== "enemy"){
            this.update_attack();
        }
        this.render();
    }

    update_move(){
        //固定轨迹运动，相对的还有追踪弹
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.render();
    }
    update_attack(){
        for(let i = 0; i < this.play.players.length; i++){
            let player = this.play.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
                break;
            }
        }
    }

    render(){
        let scale = this.play.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){
        let fireballs = this.player.fireballs;
        for(let i = 0; i < fireballs.length; i++){
            if(fireballs[i] === this){
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}class IceBall extends GameObj{
    constructor(play, player, x, y, radius, color, vx, vy, speed, move_length, damage, slow){
        super();
        this.play = play;
        this.player = player;

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.move_length = move_length;

        this.radius = radius;
        this.color = color;
        this.damage = damage;
        this.slow = slow;   //减速效果

        this.ctx = this.play.game_map.ctx;
        this.eps = 0.01;

    }
    start(){
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage, this.slow);
        if(this.play.mode === "multi mode"){
            this.play.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
            this.play.mps.send_slow(player.uuid, this.slow, this.uuid);
        }
        this.destroy();
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    //碰撞(目前只判定玩家)
    is_collision(player){
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if(distance < this.radius + player.radius){
            return true;
        }
        return false;
    }

    update(){
        this.update_move();
        if(this.player.type !== "enemy"){
            this.update_attack();
        }
        this.render();
    }

    update_move(){
        //固定轨迹运动，相对的还有追踪弹
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.render();
    }
    update_attack(){
        for(let i = 0; i < this.play.players.length; i++){
            let player = this.play.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
                break;
            }
        }
    }

    render(){
        let scale = this.play.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){
        let iceballs = this.player.iceballs;
        for(let i = 0; i < iceballs.length; i++){
            if(iceballs[i] === this){
                iceballs.splice(i, 1);
                break;
            }
        }
    }
}
class MultiPlayerSocket{
    constructor(play){
        this.play = play;
        //连接到后端wss类(通过as_asgi函数)
        this.ws = new WebSocket("wss://app2810.acapp.acwing.com.cn/wss/multiplayer/");
        //this.uuid 在外部调用时已指定为玩家uuid
        this.start();
    }

    //总的receive函数，从后端wss接收信息并交由具体receive函数处理
    receive(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if(uuid === outer.uuid) return false;

            let event = data.event;
            if(event === "create_player"){
                outer.receive_create_player(uuid, data.username, data.photo);
            }else if(event === "move_to"){
                outer.receive_move_to(uuid, data.tx, data.ty);
            }else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }else if(event === "attack"){
                outer.receive_attack(uuid, data.t_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }else if(event === "blink"){
                outer.receive_blink(uuid, data.tx, data.ty);
            }else if(event === "message"){
                outer.receive_message(data.username, data.message);
            }
        }
    }

    start(){
        this.receive();
    }
    //在创建当前玩家时调用，通知后端
    send_create_player(username, photo){
        let outer = this;
        //向websocket发送消息，将json转为字符串
        this.ws.send(JSON.stringify({
            'event' : "create_player",
            'uuid' : outer.uuid,
            'username' : username,
            'photo' : photo,
        }))
    }
    //从后端接收其他玩家的信息
    receive_create_player(uuid, username, photo){
        let player = new Player(this.play, this.play.ratio * 0.5, 0.5, 0.05, "white", 0.2, "enemy", username, photo);
        player.uuid = uuid;
        this.play.players.push(player);
    }

    get_player(uuid){
        let players = this.play.players;
        for(let i = 0; i < players.length; i++){
            if(players[i].uuid === uuid){
                let player = players[i];
                return player;
            }
        }
        return null;
    }
    //向后端发送自己移动的信息
    send_move_to(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "move_to",
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty,
        }))
    }
    //从后端接收其他玩家移动的信息
    receive_move_to(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player){
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "shoot_fireball",
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty,
            'ball_uuid' : ball_uuid,
        }))
    }
    receive_shoot_fireball(uuid, tx, ty, ball_uuid){
        let player = this.get_player(uuid);
        if(player){
            //在当前窗口为该玩家创建火球，并同步为主人窗口上火球的uuid
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(t_uuid, x, y, angle, damage, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            't_uuid': t_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }))
    }
    //收到别人击中目标的消息，对本地的目标进行更新
    receive_attack(uuid, t_uuid, x, y, angle, damage, ball_uuid){
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(t_uuid);
        if(attacker && attackee){   //两个玩家都还在
            attackee.receive_attacked(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }))
    }
    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_message(username, text){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }))
    }
    receive_message(username, text){
        this.play.cf.add_message(username, text);
    }
}class LunaPlay{
    constructor(root){
        this.root = root;
        //主分块play
        this.$play = $(`<div class = "luna-play"></div>`);
        this.root.$luna.append(this.$play);
        this.hide();
        this.start();
    }

    start(){
        let outer = this;
        //全程监听窗口大小变化
        $(window).resize(function(){
            outer.resize();
        });
    }

    resize(){
        this.width = this.$play.width();
        this.height = this.$play.height();
        //取较短一边做16:9
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        // 1 = this.height / this.scale;
        //用到实际长度直接width height，用到比例就ratio 1
        this.ratio = this.width / this.scale;
        //如果在游戏中就同时resize地图
        if(this.game_map)this.game_map.resize();
    }

    //(创建并)显示地图
    show(mode){
        let outer = this;
        this.$play.show();
        this.width = this.$play.width();
        this.height = this.$play.height();
        this.game_map = new GameMap(this);
        this.resize();
        this.players = [];
        this.mode = mode;
        this.state = "waiting";  // 对局状态
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;
        this.players.push(new Player(this, 0.5 * this.ratio, 0.5, 0.05, "white", 0.2, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "single mode"){
            console.log("进入单人模式");
            for(let i = 0; i < 9; i++){
                //随机颜色的 AI
                this.r = Math.floor(Math.random() * 255);
                this.g = Math.floor(Math.random() * 255);
                this.b = Math.floor(Math.random() * 255);
                this.players.push(new Player(this, 0.5 * this.ratio, 0.5, 0.05, "rgba(" + this.r + "," + this.g + "," + this.b + ")", 0.2, "bot"));
            }
        }else if(mode === "multi mode"){
            console.log("进入多人模式");
            this.cf = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            //获取当前客户端uuid
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }

    }

    hide(){
        this.$play.hide();
    }
}class Settings{
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        this.username = "";
        this.photo = "";    //头像的URL
        if(this.root.LunaOS) this.platform = "ACAPP";
        //jQuery是js库，起辅助作用
        //除了(#str)寻找已有div外，还有``包围html语言的方法，最后用 $() 转为jQuery封装的js对象
        //该js成员可以使用jQuery方法
        //先写好结构化的html代码，再调用方法find(".class名")提取其中某一个div，是比较整洁的方式
        this.$settings = $(`
        <div class = "luna-settings">
            <div class = "luna-settings-login">
                <div class = "luna-settings-title">
                    登录
                </div>
                <div class = "luna-settings-username">
                    <div class = "luna-settings-item">
                        <input type = "text" placeholder = "用户名">
                    </div>            
                </div>
                <div class = "luna-settings-password">
                    <div class = "luna-settings-item">
                        <input type = "password" placeholder = "密码">
                    </div>
                </div>
                <div class = "luna-settings-submit">
                    <div class = "luna-settings-item">
                        <button>登录</button>
                    </div>
                </div>
                <div class = "luna-settings-error-message"></div>
                <div class = "luna-settings-option">
                    注册
                </div>
                <br>
                <div class = "luna-settings-acwing">
                    <img width = "30" src = "https://app2810.acapp.acwing.com.cn/static/image/settings/acwing.png">
                    <br>
                    <div>
                        AcWing一键登录
                    </div>
                </div>
            </div>

            <div class = "luna-settings-register">
                <div class = "luna-settings-title">
                    注册
                </div>
                <div class = "luna-settings-username">
                    <div class = "luna-settings-item">
                        <input type = "text" placeholder = "用户名">
                    </div>            
                </div>
                <div class = "luna-settings-password luna-settings-password-first">
                    <div class = "luna-settings-item">
                        <input type = "password" placeholder = "密码">
                    </div>
                </div>
                <div class = "luna-settings-password luna-settings-password-second">
                    <div class = "luna-settings-item">
                        <input type = "password" placeholder = "确认密码">
                    </div>
                </div>
                <div class = "luna-settings-submit">
                    <div class = "luna-settings-item">
                        <button>注册</button>
                    </div>
                </div>
                <div class = "luna-settings-error-message"></div>
                <div class = "luna-settings-option">
                    登录
                </div>
                <br>
                <div class = "luna-settings-acwing">
                    <img width = "30" src = "https://app2810.acapp.acwing.com.cn/static/image/settings/acwing.png">
                    <br>
                    <div>
                        AcWing一键登录
                    </div>
                </div>
            </div>
        </div>
    `)

        this.$login = this.$settings.find(".luna-settings-login");

        this.$login_username = this.$login.find(".luna-settings-username input");
        this.$login_password = this.$login.find(".luna-settings-password input");
        this.$login_submit = this.$login.find(".luna-settings-submit button");
        this.$login_error_message = this.$login.find(".luna-settings-error-message");
        this.$login_register = this.$login.find(".luna-settings-option");
        this.$login.hide();

        this.$register = this.$settings.find(".luna-settings-register");

        this.$register_username = this.$register.find(".luna-settings-username input");
        this.$register_password = this.$register.find(".luna-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".luna-settings-password-second input");
        this.$register_submit = this.$register.find(".luna-settings-submit button");
        this.$register_error_message = this.$register.find(".luna-settings-error-message");
        this.$register_login = this.$register.find(".luna-settings-option");
        this.$register.hide();

        this.$acwing_login = this.$settings.find(".luna-settings-acwing");


        this.root.$luna.append(this.$settings);

        this.start();
    }

    start(){
        //每次刷新页面先尝试获取用户信息
        if(this.platform === "ACAPP"){
            this.getinfo_acapp();
        }else{
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    //3个按钮：登录，注册，第三方登录
    add_listening_events(){
        this.add_listening_events_login();
        this.add_listening_events_register();

        let outer = this;
        this.$acwing_login.click(function(){
            outer.acwing_login();
        })
    }
    add_listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_submit.click(function(){
            outer.login_on_remote();
        });
    }
    add_listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.register_on_remote();
        });
    }

    //用户名密码注册√
    register_on_remote(){
        let outer = this;
        let username = this.$register_username.val();   //获取输入
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();
        $.ajax({
            url: "https://app2810.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp){
                // console.log(resp);
                if(resp.result === "success"){
                    location.reload();
                }else{
                    outer.$register_error_message.html(resp.result);
                }
            }
        })
    }
    //用户名密码登录√
    login_on_remote(){
        let outer = this;
        let username = this.$login_username.val();  //获取输入
        let password = this.$login_password.val();
        this.$login_error_message.empty();  //清除错误提示
        //向后端请求
        $.ajax({
            url: "https://app2810.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp){
                // console.log(resp);
                if(resp.result === "success"){
                    location.reload();  //等效于F5刷新，信息存入cookie
                    //刷新后重新执行逻辑就可以跳过登录步骤，是必要的
                }else{
                    //打印错误消息，具体由后端决定
                    outer.$login_error_message.html(resp.result);
                }
            }
        })
    }
    //登出√
    logout_on_remote(){
        if(this.platform === "ACAPP"){
            this.root.LunaOS.api.window.close();
        }else{
            $.ajax({
                url: "https://app2810.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(resp){
                    if(resp.result === "success"){
                        location.reload();
                    }
                }
            })
        }
    }
    //网页检查是否登录，获取已登录玩家信息√
    getinfo_web(){
        let outer = this;

        $.ajax({
            url: "https://app2810.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                // console.log(resp);
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }else{
                    outer.login();
                }
            }
        })
    }

    //网页端一键登录
    acwing_login(){
        let outer = this;

        $.ajax({
            url: "https://app2810.acapp.acwing.com.cn/settings/acwing/web/apply_code",
            type: "GET",
            success:function(resp){
                // console.log(resp);
                if(resp.result === "success"){
                    window.location.replace(resp.apply_code_url);
                }
            }
        })
    }

    //acapp登录并获取玩家信息
    getinfo_acapp(){
        let outer = this;
        $.ajax({
            url: "https://app2810.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp){
                if(resp.result === "success"){
                    outer.login_acapp(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        })
    }
    //acapp登录请求后的操作
    login_acapp(appid, redirect_uri, scope, state){
        let outer = this;
        this.root.LunaOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp){
            if(resp.result === "success"){
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }


    register(){
        this.$login.hide();
        this.$register.show();
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }

    hide(){
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }
}
export class Luna{
    constructor(id, LunaOS){
        this.id = id;
        //Luna类是html下的第一层，起到衔接html和下层js类的作用
        //id是html传入的字符串，jQuery中提供$(#str)的方式，根据str寻找html中同名的div块
        //这也是一种将js成员与html class绑定的方式，只不过直接绑定html文件的场合比较少，多数还是在js内部使用jQuery
        this.$luna = $('#' + id);
        //不同平台会提供不同的OS参数
        this.LunaOS = LunaOS;
        this.settings = new Settings(this);
        this.menu = new LunaMenu(this);
        this.play = new LunaPlay(this);
        
        this.start();
    }

    start(){

    }
}
