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
}