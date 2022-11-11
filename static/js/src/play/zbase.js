class LunaPlay{
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
}