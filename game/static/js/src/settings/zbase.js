class Settings{
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
