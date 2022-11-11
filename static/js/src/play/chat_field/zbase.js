class ChatField{
    constructor(play){
        this.play = play;
        this.$history = $(`<div class="luna-chat-field-history"></div>`);
        this.$input = $(`<input type="text" class="luna-chat-field-input"></input>`);

        this.$history.hide();
        this.$input.hide();

        this.play.$play.append(this.$history);
        this.play.$play.append(this.$input);
        this.func_id = null;

        this.start();
    }
    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$input.keydown(function(e){
            if(e.which === 27){
                outer.hide_input();
                return false;
            }else if(e.which === 13){
                let username = outer.play.root.settings.username;
                let text = outer.$input.val();
                if(text){
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.play.mps.send_message(username, text);
                }
                return false;
            }
        })
    }

    render_message(message){
        return $(`<div>${message}</div>`);
    }
    add_message(username, text){
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history(){
        let outer = this;
        this.$history.fadeIn(); //jquery的淡入淡出，区别于show

        if(this.func_id) clearTimeout(this.func_id);
        this.func_id = setTimeout(function(){
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }

    show_input(){
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input(){
        this.$input.hide();
        this.play.game_map.$canvas.focus();
    }
}