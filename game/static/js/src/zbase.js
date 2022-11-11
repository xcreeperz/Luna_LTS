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
