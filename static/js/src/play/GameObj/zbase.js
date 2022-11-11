let GAME_OBJ = [];

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
