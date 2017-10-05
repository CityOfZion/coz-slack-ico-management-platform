Meteor.methods({
  enableUser(userId, teamId, name) {
    const bot = BotStorage[teamId];
    if(bot) {
      bot.enableUser(userId, name);
    }
  }
});