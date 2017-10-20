import { Meteor } from 'meteor/meteor';
import bot from '/imports/slack/bot/rtm-bot';
Meteor.startup(() => {
  Teams.find({}).forEach(team => {
    console.log('STARTING BOT FOR TEAM: ' + team.name);
    const rtm = new bot(team);
    BotStorage[team.id] = rtm;
    BotStorage[team.id].start();
  });
  
});