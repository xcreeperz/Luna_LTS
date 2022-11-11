class NoticeBoard extends GameObj{
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
}