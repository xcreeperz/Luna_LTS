class GameMap extends GameObj{
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
}