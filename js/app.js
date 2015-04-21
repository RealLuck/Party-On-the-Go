(function() {
    'use strict';

    var uuid, avatar, color, friends;

    // Assign a uuid made of a random friend and a random color
    var randomColor = function() {
        var colors = ['navy', 'green', 'slate', 'olive', 'moss', 'chocolate', 'buttercup', 'maroon', 'cerise', 'plum', 'orchid'];
        return colors[(Math.random() * colors.length) >>> 0];
    };

    var randomFriend = function() {
        var friends = ['badwan', 'kdotross', 'lilrealluck', 'mrsrealluck', 'nickel', 'realluck', 'vodka'];
        return friends[(Math.random() * friends.length) >>> 0];
    };

    color = randomColor();
    friends = 'realluck'; //randomFriend()
    uuid = friends;
    avatar = 'images/' + friends + '.png';

    function showNewest() {
        //document.querySelector('core-scaffold').$.headerPanel.scroller.scrollTop = document.querySelector('.chat-list').scrollHeight;
        var chatDiv = document.querySelector('.chat-list');
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    /* Polymer UI and UX */

    var template = document.querySelector('template[is=auto-binding]');

    template.channel = 'polymer-chat';
    template.uuid = uuid;
    template.avatar = avatar;
    template.color = color;

    template.checkKey = function(e) {
        if(e.keyCode === 13 || e.charCode === 13) {
            template.publish();
        }
    };

    template.sendMyMessage = function(e) {
        template.publish();
    };

    template.messageList = [];


    /* PubNub Realtime Chat */

    var pastMsgs = [];
    var onlineUuids = [];

    template.getListWithOnlineStatus = function(list) {
        [].forEach.call(list, function(l) {
            if(onlineUuids.indexOf(l.uuid) > -1) {
                l.status = 'online';
            } else {
                l.status = 'offline';
            }
        });
        return list;
    };

    template.displayChatList = function(list) {
        template.messageList = list;
        // scroll to bottom when all list items are displayed
        template.async(showNewest);
    };

    template.subscribeCallback = function(e) {
        if(template.$.sub.messages.length > 0) {
            this.displayChatList(pastMsgs.concat(this.getListWithOnlineStatus(template.$.sub.messages)));
        }
    };

    template.presenceChanged = function(e) {
        var i = 0;
        var l = template.$.sub.presence.length;
        var d = template.$.sub.presence[l - 1];

        // how many users
        template.occupancy = d.occupancy;

        // who are online
        if(d.action === 'join') {
            if(d.uuid.length > 35) { // console
                d.uuid = 'RealLuck';
            }
            onlineUuids.push(d.uuid);
        } else {
            var idx = onlineUuids.indexOf(d.uuid);
            if(idx > -1) {
                onlineUuids.splice(idx, 1);
            }
        }

        i++;

        // display at the left column
        template.cats = onlineUuids;
        // update the status at the main column
        if(template.messageList.length > 0) {
            template.messageList = this.getListWithOnlineStatus(template.messageList);
        }
    };

    template.historyRetrieved = function(e) {
        if(e.detail[0].length > 0) {
            pastMsgs = this.getListWithOnlineStatus(e.detail[0]);
            this.displayChatList(pastMsgs);
        }
    };

    template.publish = function() {
        if(!template.input) return;

        template.$.pub.message = {
            uuid: uuid,
            avatar: avatar,
            color: color,
            text: template.input,
            timestamp: new Date().toISOString()
        };
        template.$.pub.publish();
        template.input = '';
    };

    template.error = function(e) {
        console.log(e);
    };

})();