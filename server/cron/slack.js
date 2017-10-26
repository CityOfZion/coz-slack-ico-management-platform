import bot from '/imports/slack/bot/rtm-bot';

SyncedCron.add({
  name: 'File remover',
  schedule: function(parser) {
    return parser.recur().every(6).hour();
  },
  job: function() {
    Teams.find({}).forEach(team => {
      if(team.settings.limitFileUploads && team.settings.fileExpireDays > 0) {
        const bot = BotStorage[team.id];
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - team.settings.fileExpireDays);
        const query = {team: team.id, dateUploaded: {$lt: checkDate}};
        const files = Files.find(query)
        if(files.count() > 0) {
          files.forEach(file => {
            Files.remove(file);
            bot.deleteFile(file.id);
          })
        }
      }
    })
  }
});

SyncedCron.add({
  name: 'Message remover',
  schedule: function(parser) {
    return parser.recur().every(6).hour();
  },
  job: function() {
    Teams.find({}).forEach(team => {
      if(team.settings.deleteOldMessages && team.settings.messageExpireDays > 0) {
        const bot = BotStorage[team.id];
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - team.settings.messageExpireDays);
        const query = {team: team.id, datePosted: {$lt: checkDate}};
        const messages = Messages.find(query);
        if(messages.count() > 0) {
          messages.forEach(message => {
            Messages.remove(message);
            bot.deleteMessage(message.ts, message.channel);
          })
        }
      }
    })
  }
});

SyncedCron.add({
  name: 'Bot starter',
  schedule: function(parser) {
    return parser.recur().every(5).second();
  },
  job: function() {
    Teams.find({}).forEach(team => {
      const botInfo = Bots.findOne({teamId: team.id});
      const lastUpdatedInSeconds = (new Date().getTime() - new Date(botInfo.dateUpdated).getTime()) / 1000;
      if(!botInfo || !botInfo.running || lastUpdatedInSeconds > 10 || botInfo.restart) {
        if (!BotStorage[team.id] && !bot.restart) {
          console.log('starting bot for ', team.name);
          const rtm = new bot(team);
          BotStorage[team.id] = rtm;
          BotStorage[team.id].start();
        } else if(BotStorage[team.id]) {
          console.log('restarting bot for ', team.name);
          BotStorage[team.id].restart();
        }
      } else {
        Bots.update({teamId: team.id}, {$set: {dateUpdated: new Date()}})
      }
    })
  }
});

SyncedCron.start();
