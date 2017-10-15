import {isAdmin} from '/imports/slack/helpers';

Meteor.methods({
  enableUser(userId, name) {
    if(!isAdmin(Meteor.user())) return false;
    
    const bot = BotStorage[Meteor.user().profile.team_id];
    if(bot) {
      bot.enableUser(userId, name, Meteor.user().user.profile.identity.user.name);
    }
  },
  importMessages() {
    if(!isAdmin(Meteor.user())) return false;
  
    const bot = BotStorage[Meteor.user().profile.team_id];
  
    if(bot) {
      bot.importMessages();
    }
  },
  importFiles() {
    if(!isAdmin(Meteor.user())) return false;
  
    const bot = BotStorage[Meteor.user().profile.team_id];
  
    if(bot) {
      bot.importFiles();
    }
  }
});