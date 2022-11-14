class Player extends GameObj{
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
            this.username = username;
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
        if(this.type === "bot" && this.spent_time > 3 && Math.random() < 1 / 300.0){
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
            this.play.notice_board.write("Game Over");
        }
        let players = this.play.players;
        for(let i = 0; i < players.length; i++){
            if(players[i] === this){
                players.splice(i, 1);
                break;
            }
        }
        if(this.play.players.length <= 1 && this.play.state === "fighting"){
            this.play.notice_board.write("游戏结束, 胜者是: " + this.username);
        }
    }
}
