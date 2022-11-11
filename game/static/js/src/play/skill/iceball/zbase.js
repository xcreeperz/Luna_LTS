class IceBall extends GameObj{
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
