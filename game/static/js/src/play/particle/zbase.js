class Particle extends GameObj{
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
}