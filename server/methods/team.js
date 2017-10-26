import {isAdmin} from "/imports/slack/helpers";

Meteor.methods({
  saveSettings(settings, reset = true) {
    if(!isAdmin(Meteor.user())) return false;
    const teamId = Meteor.user().profile.auth.team_id;
    Teams.update({id: teamId}, {$set: {settings: settings}});
    
    if(reset) {
      Bots.update({teamId: teamId}, {$set: {restart: true}})
    }
  }
});